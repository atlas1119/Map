(function () {
    var ua = navigator.userAgent.toLowerCase(),
        ie = !!window.ActiveXObject,
		webkit = ua.indexOf("webkit") !== -1,
		gecko = ua.indexOf("gecko") !== -1,
    
		chrome = ua.indexOf("chrome") !== -1,
		opera = window.opera,

		doc = document.documentElement,
		ie3d = ie && ('transition' in doc.style),
		webkit3d = webkit && ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()),
		gecko3d = gecko && ('MozPerspective' in doc.style),
		opera3d = opera && ('OTransition' in doc.style);


    Atlas.Browser = {
        ua: ua,
        webkit: webkit,
        gecko: gecko,
        opera: opera,

        chrome: chrome,

        ie3d: ie3d,
        webkit3d: webkit3d,
        gecko3d: gecko3d,
        opera3d: opera3d,
        any3d: !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d || opera3d)

    };
} ());
