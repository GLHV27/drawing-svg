export const EVENTS = {
    START_WAITING: 'startWaiting',
    CREATE_POLYGON: 'createPolygon',
    REMOVE_POLYGON: 'removePolygon',
    CUSTOM_CLICK: 'customClick',
    END_PAN_STOP_ANIMATE: 'endPanStopAnimate'
};

export const MOUSE_CODE = {
    LEFT: 0,
    WHEEL: 1,
    RIGHT: 2
};

export const KEY_CODE = {
    ESCAPE: 27,
    DELETE: 46
};

export const CLASSES = {
    svg: 'drawing-svg',
    circle: 'drawing-svg__circle',
    circleFirst: 'drawing-svg__circle_first',
    circleLast: 'drawing-svg__circle_last',
    polygon: 'drawing-svg__polygon',
    polygonDrawing: 'drawing-svg__polygon_drawing',
    polygonFocus: 'drawing-svg__polygon_focus',
    polygonDisabled: 'drawing-svg__polygon_disabled'
};

export const DEF_PARAMS = {
    circle: {
        radius: 8
    }
};

export const ZOOM = {
    BOUNDS: false,
    FACTOR: 0.03,
    MAX: 3,
    DURATION: 100
};
