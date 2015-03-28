
var Atlas, originalAtlas;

if (typeof exports !== undefined + '') {
    Atlas = exports;
} else {
    originalAtlas = window.Atlas;
    Atlas = {};

    Atlas.noConflict = function () {
        window.Atlas = originalAtlas;
        return this;
    };

    window.Atlas = Atlas;
}

Atlas.version = '0.0';