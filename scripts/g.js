Object.deepExtend = function(destination, source) {
    for (var property in source) {
        if (source[property] && source[property].constructor && source[property].constructor === Object) {
            destination[property] = destination[property] || {};
            arguments.callee(destination[property], source[property]);
        } else {
            destination[property] = source[property];
        }
    }
    return destination;
}
Object.isArray = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}
Function.prototype.extend = function(parentClassOrObject) {
    if (parentClassOrObject.constructor == Function) {
        // Normal inheritance
        this.prototype = new parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject.prototype;
    }
    else {
        // Pure virtual inheritance
        this.prototype = parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject;
    }
    return this;
}
var GConst = (function() {
    var constants = {};
    function GConst() {}
    GConst.define = function(key, value) {
        Object.defineProperty(constants, key, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: value
        });
    }
    GConst.read = function(key, defaultReturnValue) {
        if (!defaultReturnValue) {
            defaultReturnValue = undefined;
        }
        if (constants.hasOwnProperty(key)) {
            return constants[key];
        }
        return defaultReturnValue;
    }
    return GConst;
})();
var GGlobal = (function() {
    var globals = {};
    function GGlobal() {}
    GGlobal.set = function(key, value) {
        globals[key] = value;
    }
    GGlobal.get = function(key, defaultReturnValue) {
        if (!defaultReturnValue) {
            defaultReturnValue = undefined;
        }
        if (globals.hasOwnProperty(key)) {
            return globals[key];
        }
        return defaultReturnValue;
    }
    return GGlobal;
})();
var GError = (function() {
    function GError(message) {
        this.name = 'GError';
        this.message = message;
        this.stack = (new Error()).stack;
    }
    GError.extend(Error);
    return GError;
})();
var GLog = (function() {
    function GLog(data) {
        if (GGlobal.get('log', 0)) {
            console.log(data);
        }
    }
    return GLog;
})();
var GSelect = (function() {
    function GSelect(selector) {
        var selectorType = selector[0],
            htmlSelectorValue = selector.substr(1, selector.length);
        if ('#' == selectorType) {
            return document.getElementById(htmlSelectorValue);
        }
        else if ('.' == selectorType) {
            // @todo: implementation
        }
    }
    return GSelect;
})();
var GCanvas = (function() {
    var options = {},
        defaultOptions = {},
        canvasHtml;
    function GCanvas() {}
    GCanvas.prototype.setCanvasHTML = function(canvasHTMLElement) {
        canvasHtml = canvasHTMLElement;
    }
    GCanvas.prototype.getCanvasHTML = function() {
        return canvasHtml;
    }
    GCanvas.prototype.setOption = function(key, value) {
        options[key] = value;
    }
    GCanvas.prototype.setOptions = function(opts) {
        options = Object.deepExtend(defaultOptions, opts);
    }
    GCanvas.prototype.getOptions = function() {
        return options;
    }
    GCanvas.prototype.init = function() {}
    GCanvas.prototype.draw = function() {
        return canvasHtml.draw();
    }
    GCanvas.prototype.drawSquare = function(opts) {
        return canvasHtml.drawSquare(opts);
    }
    GCanvas.prototype.drawCircle = function(opts) {
        return canvasHtml.drawCircle(opts);
    }
    GCanvas.prototype.drawPath = function(opts) {
        return canvasHtml.drawPath(opts);
    }
    return GCanvas;
})();
var GCanvasFactory = (function() {
    function GCanvasFactory() {}
    GCanvasFactory.create = function(params) {
        var canvas = new params.klass();
        canvas.setOptions(params.options);
        return canvas;
    }
    return GCanvasFactory;
})();
var GHTMLElement = (function() {
    var tag = '',
        attributes = {},
        htmlElement;
    function GHTMLElement(tagName) {
        tag = tagName;
    }
    GHTMLElement.prototype.setAttributes = function(attr) {
        attributes = Object.deepExtend(attributes, attr);
    }
    GHTMLElement.prototype.create = function() {
        htmlElement = document.createElement(tag);
        htmlElement = Object.deepExtend(htmlElement, attributes);
        document.body.appendChild(htmlElement);
    }
    GHTMLElement.prototype.setElement = function(element) {
        htmlElement = element;
    }
    GHTMLElement.prototype.getElement = function() {
        return htmlElement;
    }
    return GHTMLElement;
})();
var GHTMLCanvasElement = (function() {
    function GHTMLCanvasElement() {
        var options = {},
            defaults = {};
        this.setOptions = function(opts) {
            options = opts;
            return this;
        }
        this.getOptions = function() {
            return options;
        }
        this.render = function(context) {
            throw new GError('This is abstract method');
        }
        this.setDefault = function(key, value) {
            defaults[key] = value;
        }
        this.getDefault = function(key, defaultReturnValue) {
            if (defaults.hasOwnProperty(key)) {
                return defaults[key];
            }
            return defaultReturnValue;
        }
        this.setDefault('strokeStyle', '#000');
        this.setDefault('lineWidth', '1');
        this.setDefault('fillStyle', 'transient');
        this.setDefault('_drawMethods', ['stroke']);
    }
    return GHTMLCanvasElement;
})();
var GHTMLCanvasElementSquare = (function() {
    function GHTMLCanvasElementSquare() {
        GHTMLCanvasElement.call(this);
        this.render = function(context) {
            var options = this.getOptions();
            context.beginPath();
            context.strokeStyle = options.strokeStyle || this.getDefault('strokeStyle');
            context.lineWidth = options.lineWidth || this.getDefault('lineWidth');
            context.fillStyle = options.fillStyle || this.getDefault('fillStyle');
            context.rect(options.x, options.y, options.width, options.height);
            context.closePath();
            var drawMethods = Object.deepExtend(this.getDefault('_drawMethods'), options['_drawMethods']);
            drawMethods.forEach(function(drawMethodName) {
                context[drawMethodName]();
            });
        }
    }
    GHTMLCanvasElementSquare.extend(GHTMLCanvasElement);
    return GHTMLCanvasElementSquare;
})();
var GHTMLCanvasElementCircle = (function() {
    function GHTMLCanvasElementCircle() {
        GHTMLCanvasElement.call(this);
        this.render = function(context) {
            var options = this.getOptions();
            context.beginPath();
            context.strokeStyle = options.strokeStyle || this.getDefault('strokeStyle');
            context.lineWidth = options.lineWidth || this.getDefault('lineWidth');
            context.fillStyle = options.fillStyle || this.getDefault('fillStyle');
            context.arc(options.x, options.y, options.r, options.sAngle, options.eAngle, options.counterclockwise);
            context.closePath();
            var drawMethods = Object.deepExtend(this.getDefault('_drawMethods'), options['_drawMethods']);
            drawMethods.forEach(function(drawMethodName) {
                context[drawMethodName]();
            });
        }
    }
    GHTMLCanvasElementCircle.extend(GHTMLCanvasElement);
    return GHTMLCanvasElementCircle;
})();
var GHTMLCanvasElementPath = (function() {
    function GHTMLCanvasElementPath() {
        GHTMLCanvasElement.call(this);
        this.render = function(context) {
            var options = this.getOptions();
            context.beginPath();
            context.strokeStyle = options.strokeStyle || this.getDefault('strokeStyle');
            context.lineWidth = options.lineWidth || this.getDefault('lineWidth');
            context.fillStyle = options.fillStyle || this.getDefault('fillStyle');
            for (var k in options.coordinates) {
                context.lineTo(options.coordinates[k].x, options.coordinates[k].y);
            }
            context.closePath();
            var drawMethods = Object.deepExtend(this.getDefault('_drawMethods'), options['_drawMethods']);
            drawMethods.forEach(function(drawMethodName) {
                context[drawMethodName]();
            });
        }
    }
    GHTMLCanvasElementPath.extend(GHTMLCanvasElement);
    return GHTMLCanvasElementPath;
})();
var GHTMLCanvas = (function() {
    var canvasStack = [];
    function GHTMLCanvas() {
        GHTMLElement.call(this, 'canvas');
    }
    GHTMLCanvas.extend(GHTMLElement);
    GHTMLCanvas.prototype.getContext = function() {
        return GHTMLElement.prototype.getElement.call(this).getContext('2d');
    }
    GHTMLCanvas.prototype.draw = function() {}
    GHTMLCanvas.prototype.drawSquare = function(opts) {
        var options = Object.deepExtend({
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            strokeStyle: undefined,
            fillStyle: undefined,
            lineWidth: undefined,
            _drawMethods: []
        }, opts);
        canvasStack.push({frame: new GHTMLCanvasElementSquare().setOptions(options)});
        return this;
    }
    GHTMLCanvas.prototype.drawCircle = function(opts) {
        var options = Object.deepExtend({
            x: 0,
            y: 0,
            r: 0,
            sAngle: 0,
            eAngle: 0,
            counterclockwise: 0,
            strokeStyle: undefined,
            fillStyle: undefined,
            lineWidth: undefined,
            _drawMethods: []
        }, opts);
        canvasStack.push({frame: new GHTMLCanvasElementCircle().setOptions(options)});
        return this;
    }
    GHTMLCanvas.prototype.drawPath = function(opts) {
        if (!Object.isArray(opts.coordinates) || !opts.coordinates.length) {
            return;
        }
        var options = Object.deepExtend({
            x: 0,
            y: 0,
            r: 0,
            sAngle: 0,
            eAngle: 0,
            counterclockwise: 0,
            strokeStyle: undefined,
            fillStyle: undefined,
            lineWidth: undefined,
            coordinates: [],
            _drawMethods: []
        }, opts);
        canvasStack.push({frame: new GHTMLCanvasElementPath().setOptions(opts)});
        return this;
    }
    GHTMLCanvas.prototype.render = function(opts) {
        var context = GHTMLElement.prototype.getElement.call(this).getContext('2d');
        for (var k in canvasStack) {
            canvasStack[k].frame.render(context);
        }
        return this;
    }
    return GHTMLCanvas;
})();
var GCanvasGenerator = (function() {
    var options = {},
        defaultOptions = {
            klassHTML: GHTMLCanvas
        },
        canvasAttributes = {},
        defaultCanvasAttributes = {
            width: 800,
            height: 600
        };
    function GCanvasGenerator() {
        canvasAttributes = defaultCanvasAttributes;
    }
    GCanvasGenerator.prototype.setCanvasAttributes = function(attr) {
        canvasAttributes = Object.deepExtend(canvasAttributes, attr);
    }
    GCanvasGenerator.prototype.getCanvasAttributes = function() {
        return canvasAttributes;
    }
    GCanvasGenerator.prototype.setOption = function(key, value) {
        options[key] = value;
    }
    GCanvasGenerator.prototype.setOptions = function(opts) {
        options = Object.deepExtend(defaultOptions, opts);
    }
    GCanvasGenerator.prototype.getOptions = function() {
        return options;
    }
    GCanvasGenerator.prototype.generate = function() {
        var canvas = new options.klassHTML();
        canvas.setAttributes(canvasAttributes);
        return canvas;
    }
    return GCanvasGenerator;
})();
var GCanvasGeneratorFactory = (function() {
    function GCanvasGeneratorFactory() {}
    GCanvasGeneratorFactory.create = function(params) {
        var generator = new params.klass();
        generator.setOptions(params.options);
        return generator;
    }
    return GCanvasGeneratorFactory;
})();
var G = (function() {
    var canvas,
        canvasHTML,
        options = {},
        defaultOptions = {
            canvas: {
                // generator: GCanvasGenerator,
                generatorFactory: GCanvasGeneratorFactory,
                generatorFactoryParams: {},
                // selector: '',
                klass: GCanvas,
                factory: GCanvasFactory,
                factoryParams: {},
                klassHTML: GHTMLCanvas
            }
        };
    function G() {
        GGlobal.set('log', 0);
    }
    G.prototype.setOptions = function(opts) {
        options = Object.deepExtend(defaultOptions, opts);
    }
    G.prototype.init = function() {
        if (options.canvas.hasOwnProperty('generator'))
        {
            var generatorFactoryParams = {klassHTML: options.canvas.klassHTML};
            Object.deepExtend(generatorFactoryParams, options.canvas.generatorFactoryParams);
            // @todo: check options.canvas.generator is instance of GCanvasGenerator
            var canvasGenerator = options.canvas.generatorFactory.create({
                klass: options.canvas.generator,
                // options: options.canvas.generatorFactoryParams
                options: generatorFactoryParams
            });
            canvasHTML = canvasGenerator.generate();
            canvasHTML.create();
        }
        else if (options.canvas.hasOwnProperty('selector')) {
            canvasHTML = new options.canvas.klassHTML();
            canvasHTMLSelector = GSelect(options.canvas.selector);
            canvasHTML.setElement(canvasHTMLSelector);
        }
        else {
            throw new GError('Need at least canvas.generator or canvas.selector to be set properly');
        }
        // @todo: check options.canvas.factory is instance of GCanvasFactory
        // @todo: check options.canvas.klass is instance of GCanvas
        // @todo: check options.canvas.factoryParams is object ({})
        canvas = options.canvas.factory.create({
            klass: options.canvas.klass,
            options: options.canvas.factoryParams
        });
        canvas.setCanvasHTML(canvasHTML);
        canvas.init();
    }
    G.prototype.draw = function() {
        canvas.draw();
    }
    G.prototype.getCanvas = function() {
        return canvas;
    }
    G.prototype.getCanvasHTML = function() {
        return canvasHTML;
    }
    return G;
})();
