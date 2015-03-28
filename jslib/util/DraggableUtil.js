/*
* 地图拖拽类
*/
Atlas.Draggable = Atlas.Class.extend({
    includes: Atlas.Custom.Events,

    statics: {
        START: 'mousedown',
        END: 'mouseup',
        MOVE:'mousemove'
    },

    initialize: function (element, dragStartTarget) {
        this._element = element;
        this._dragStartTarget = dragStartTarget || element;
    },

    enable: function () {
        if (this._enabled) {
            return;
        }
        Atlas.DomEvent.on(this._dragStartTarget, Atlas.Draggable.START, this._onDown, this);
        this._enabled = true;
    },

    disable: function () {
        if (!this._enabled) {
            return;
        }
        Atlas.DomEvent.off(this._dragStartTarget, Atlas.Draggable.START, this._onDown);
        this._enabled = false;
        this._moved = false;
    },

    _onDown: function (e) {
        if (e.shiftKey || ((e.which !== 1) && e.button !== 1)) {
            return;
        }

        this._simulateClick = true;

        var first = e,
			el = first.target;

        Atlas.DomEvent.preventDefault(e);


        this._moved = false;
        if (this._moving) {
            return;
        }

        this._startPos = this._newPos = Atlas.DomUtil.getPosition(this._element);
        this._startPoint = new Atlas.Point(first.clientX, first.clientY);

        Atlas.DomEvent.on(document, Atlas.Draggable.MOVE, this._onMove, this);
        Atlas.DomEvent.on(document, Atlas.Draggable.END, this._onUp, this);
    },

    _onMove: function (e) {

        var first = e,
			newPoint = new Atlas.Point(first.clientX, first.clientY),
			diffVec = newPoint.subtract(this._startPoint);

        if (!diffVec.x && !diffVec.y) { return; }

        Atlas.DomEvent.preventDefault(e);

        if (!this._moved) {
            this.fire('dragstart');
            this._moved = true;

            Atlas.DomUtil.disableTextSelection();
            this._setMovingCursor();
        }

        this._newPos = this._startPos.add(diffVec);
        this._moving = true;

        Atlas.Util.cancelAnimFrame(this._animRequest);
        this._animRequest = Atlas.Util.requestAnimFrame(this._updatePosition, this, true, this._dragStartTarget);
    },

    _updatePosition: function () {
        this.fire('predrag');
        Atlas.DomUtil.setPosition(this._element, this._newPos);
        this.fire('drag');
    },

    _onUp: function (e) {

        Atlas.DomUtil.enableTextSelection();
        this._restoreCursor();

        Atlas.DomEvent.off(document, Atlas.Draggable.MOVE, this._onMove);
        Atlas.DomEvent.off(document, Atlas.Draggable.END, this._onUp);

        if (this._moved) {
            //
            Atlas.Util.cancelAnimFrame(this._animRequest);

            this.fire('dragend');
        }
        this._moving = false;
    },

    _setMovingCursor: function () {
        Atlas.DomUtil.addClass(document.body, 'atlas-dragging');
    },

    _restoreCursor: function () {
        Atlas.DomUtil.removeClass(document.body, 'atlas-dragging');
    },

    _simulateEvent: function (type, e) {
        var simulatedEvent = document.createEvent('MouseEvents');

        simulatedEvent.initMouseEvent(
				type, true, true, window, 1,
				e.screenX, e.screenY,
				e.clientX, e.clientY,
				false, false, false, false, 0, null);

        e.target.dispatchEvent(simulatedEvent);
    }
});
