'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs-extra');
var path = require('path');
var LiveServer = require('live-server');
var Handlebars = require('handlebars');

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var gutil = require('gulp-util');
var c = gutil.colors;
var pkg$1 = require('../package.json');
var LEVEL;
(function (LEVEL) {
    LEVEL[LEVEL["INFO"] = 0] = "INFO";
    LEVEL[LEVEL["DEBUG"] = 1] = "DEBUG";
    LEVEL[LEVEL["ERROR"] = 2] = "ERROR";
    LEVEL[LEVEL["WARN"] = 3] = "WARN";
})(LEVEL || (LEVEL = {}));
var Logger = (function () {
    function Logger() {
        this.name = pkg$1.name;
        this.version = pkg$1.version;
        this.logger = gutil.log;
        this.silent = true;
    }
    Logger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.silent)
            return;
        this.logger(this.format.apply(this, [LEVEL.INFO].concat(args)));
    };
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.silent)
            return;
        this.logger(this.format.apply(this, [LEVEL.ERROR].concat(args)));
    };
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.silent)
            return;
        this.logger(this.format.apply(this, [LEVEL.WARN].concat(args)));
    };
    Logger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.silent)
            return;
        this.logger(this.format.apply(this, [LEVEL.DEBUG].concat(args)));
    };
    Logger.prototype.format = function (level) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var pad = function (s, l, c) {
            if (c === void 0) { c = ''; }
            return s + Array(Math.max(0, l - s.length + 1)).join(c);
        };
        var msg = args.join(' ');
        if (args.length > 1) {
            msg = pad(args.shift(), 15, ' ') + ": " + args.join(' ');
        }
        switch (level) {
            case LEVEL.INFO:
                msg = c.green(msg);
                break;
            case LEVEL.DEBUG:
                msg = c.cyan(msg);
                break;
            case LEVEL.WARN:
                msg = c.yellow(msg);
                break;
            case LEVEL.ERROR:
                msg = c.red(msg);
                break;
        }
        return [
            msg
        ].join('');
    };
    return Logger;
}());
var logger = new Logger();

var AngularAPIs = require('../src/data/api-list.json');
var _$2 = require('lodash');
function finderInAngularAPIs(type) {
    var _result = {
        source: 'external',
        data: null
    };
    _$2.forEach(AngularAPIs, function (angularModuleAPIs, angularModule) {
        var i = 0, len = angularModuleAPIs.length;
        for (i; i < len; i++) {
            if (angularModuleAPIs[i].title === type) {
                _result.data = angularModuleAPIs[i];
            }
        }
    });
    return _result;
}

var _$1 = require('lodash');
var DependenciesEngine = (function () {
    function DependenciesEngine() {
        if (DependenciesEngine._instance) {
            throw new Error('Error: Instantiation failed: Use DependenciesEngine.getInstance() instead of new.');
        }
        DependenciesEngine._instance = this;
    }
    DependenciesEngine.getInstance = function () {
        return DependenciesEngine._instance;
    };
    DependenciesEngine.prototype.cleanModules = function (modules) {
        var _m = modules, i = 0, len = modules.length;
        for (i; i < len; i++) {
            var j = 0, leng = _m[i].declarations.length;
            for (j; j < leng; j++) {
                var k = 0, lengt = void 0;
                if (_m[i].declarations[j].jsdoctags) {
                    lengt = _m[i].declarations[j].jsdoctags.length;
                    for (k; k < lengt; k++) {
                        delete _m[i].declarations[j].jsdoctags[k].parent;
                    }
                }
                if (_m[i].declarations[j].constructorObj) {
                    if (_m[i].declarations[j].constructorObj.jsdoctags) {
                        lengt = _m[i].declarations[j].constructorObj.jsdoctags.length;
                        for (k; k < lengt; k++) {
                            delete _m[i].declarations[j].constructorObj.jsdoctags[k].parent;
                        }
                    }
                }
                if (_m[i].declarations[j].methodsClass && _m[i].declarations[j].methodsClass.length > 0) {
                    var l = 0, length = _m[i].declarations[j].methodsClass.length;
                    for (l; l < length; l++) {
                        delete _m[i].declarations[j].methodsClass[l].jsdoctags;
                    }
                }
                if (_m[i].declarations[j].propertiesClass && _m[i].declarations[j].propertiesClass.length > 0) {
                    var l = 0, length = _m[i].declarations[j].propertiesClass.length;
                    for (l; l < length; l++) {
                        delete _m[i].declarations[j].propertiesClass[l].jsdoctags;
                    }
                }
            }
        }
        return _m;
    };
    DependenciesEngine.prototype.init = function (data) {
        this.rawData = data;
        this.modules = _$1.sortBy(this.rawData.modules, ['name']);
        this.rawModulesForOverview = _$1.sortBy(_$1.cloneDeep(this.cleanModules(data.modules)), ['name']);
        this.rawModules = _$1.sortBy(_$1.cloneDeep(this.cleanModules(data.modules)), ['name']);
        this.components = _$1.sortBy(this.rawData.components, ['name']);
        this.directives = _$1.sortBy(this.rawData.directives, ['name']);
        this.injectables = _$1.sortBy(this.rawData.injectables, ['name']);
        this.interfaces = _$1.sortBy(this.rawData.interfaces, ['name']);
        this.pipes = _$1.sortBy(this.rawData.pipes, ['name']);
        this.classes = _$1.sortBy(this.rawData.classes, ['name']);
        this.miscellaneous = this.rawData.miscellaneous;
        this.prepareMiscellaneous();
        this.routes = this.rawData.routesTree;
        this.cleanRawModulesForOverview();
    };
    DependenciesEngine.prototype.find = function (type) {
        var finderInCompodocDependencies = function (data) {
            var _result = {
                source: 'internal',
                data: null
            }, i = 0, len = data.length;
            for (i; i < len; i++) {
                if (typeof type !== 'undefined') {
                    if (type.indexOf(data[i].name) !== -1) {
                        _result.data = data[i];
                    }
                }
            }
            return _result;
        }, resultInCompodocInjectables = finderInCompodocDependencies(this.injectables), resultInCompodocInterfaces = finderInCompodocDependencies(this.interfaces), resultInCompodocClasses = finderInCompodocDependencies(this.classes), resultInCompodocComponents = finderInCompodocDependencies(this.components), resultInAngularAPIs = finderInAngularAPIs(type);
        if (resultInCompodocInjectables.data !== null) {
            return resultInCompodocInjectables;
        }
        else if (resultInCompodocInterfaces.data !== null) {
            return resultInCompodocInterfaces;
        }
        else if (resultInCompodocClasses.data !== null) {
            return resultInCompodocClasses;
        }
        else if (resultInCompodocComponents.data !== null) {
            return resultInCompodocComponents;
        }
        else if (resultInAngularAPIs.data !== null) {
            return resultInAngularAPIs;
        }
    };
    DependenciesEngine.prototype.update = function (updatedData) {
        var _this = this;
        if (updatedData.modules.length > 0) {
            _$1.forEach(updatedData.modules, function (module) {
                var _index = _$1.findIndex(_this.modules, { 'name': module.name });
                _this.modules[_index] = module;
            });
        }
        if (updatedData.components.length > 0) {
            _$1.forEach(updatedData.components, function (component) {
                var _index = _$1.findIndex(_this.components, { 'name': component.name });
                _this.components[_index] = component;
            });
        }
        if (updatedData.directives.length > 0) {
            _$1.forEach(updatedData.directives, function (directive) {
                var _index = _$1.findIndex(_this.directives, { 'name': directive.name });
                _this.directives[_index] = directive;
            });
        }
        if (updatedData.injectables.length > 0) {
            _$1.forEach(updatedData.injectables, function (injectable) {
                var _index = _$1.findIndex(_this.injectables, { 'name': injectable.name });
                _this.injectables[_index] = injectable;
            });
        }
        if (updatedData.interfaces.length > 0) {
            _$1.forEach(updatedData.interfaces, function (int) {
                var _index = _$1.findIndex(_this.interfaces, { 'name': int.name });
                _this.interfaces[_index] = int;
            });
        }
        if (updatedData.pipes.length > 0) {
            _$1.forEach(updatedData.pipes, function (pipe) {
                var _index = _$1.findIndex(_this.pipes, { 'name': pipe.name });
                _this.pipes[_index] = pipe;
            });
        }
        if (updatedData.classes.length > 0) {
            _$1.forEach(updatedData.classes, function (classe) {
                var _index = _$1.findIndex(_this.classes, { 'name': classe.name });
                _this.classes[_index] = classe;
            });
        }
        /**
         * Miscellaneous update
         */
        if (updatedData.miscellaneous.variables.length > 0) {
            _$1.forEach(updatedData.miscellaneous.variables, function (variable) {
                var _index = _$1.findIndex(_this.miscellaneous.variables, {
                    'name': variable.name,
                    'file': variable.file
                });
                _this.miscellaneous.variables[_index] = variable;
            });
        }
        if (updatedData.miscellaneous.functions.length > 0) {
            _$1.forEach(updatedData.miscellaneous.functions, function (func) {
                var _index = _$1.findIndex(_this.miscellaneous.functions, {
                    'name': func.name,
                    'file': func.file
                });
                _this.miscellaneous.functions[_index] = func;
            });
        }
        if (updatedData.miscellaneous.typealiases.length > 0) {
            _$1.forEach(updatedData.miscellaneous.typealiases, function (typealias) {
                var _index = _$1.findIndex(_this.miscellaneous.typealiases, {
                    'name': typealias.name,
                    'file': typealias.file
                });
                _this.miscellaneous.typealiases[_index] = typealias;
            });
        }
        if (updatedData.miscellaneous.enumerations.length > 0) {
            _$1.forEach(updatedData.miscellaneous.enumerations, function (enumeration) {
                var _index = _$1.findIndex(_this.miscellaneous.enumerations, {
                    'name': enumeration.name,
                    'file': enumeration.file
                });
                _this.miscellaneous.enumerations[_index] = enumeration;
            });
        }
        if (updatedData.miscellaneous.types.length > 0) {
            _$1.forEach(updatedData.miscellaneous.types, function (typ) {
                var _index = _$1.findIndex(_this.miscellaneous.types, {
                    'name': typ.name,
                    'file': typ.file
                });
                _this.miscellaneous.types[_index] = typ;
            });
        }
        this.prepareMiscellaneous();
    };
    DependenciesEngine.prototype.findInCompodoc = function (name) {
        var mergedData = _$1.concat([], this.modules, this.components, this.directives, this.injectables, this.interfaces, this.pipes, this.classes), result = _$1.find(mergedData, { 'name': name });
        return result || false;
    };
    DependenciesEngine.prototype.cleanRawModulesForOverview = function () {
        _$1.forEach(this.rawModulesForOverview, function (module) {
            module.declarations = [];
            module.providers = [];
        });
    };
    DependenciesEngine.prototype.prepareMiscellaneous = function () {
        //group each subgoup by file
        this.miscellaneous.groupedVariables = _$1.groupBy(this.miscellaneous.variables, 'file');
        this.miscellaneous.groupedFunctions = _$1.groupBy(this.miscellaneous.functions, 'file');
        this.miscellaneous.groupedEnumerations = _$1.groupBy(this.miscellaneous.enumerations, 'file');
    };
    DependenciesEngine.prototype.getModule = function (name) {
        return _$1.find(this.modules, ['name', name]);
    };
    DependenciesEngine.prototype.getRawModule = function (name) {
        return _$1.find(this.rawModules, ['name', name]);
    };
    DependenciesEngine.prototype.getModules = function () {
        return this.modules;
    };
    DependenciesEngine.prototype.getComponents = function () {
        return this.components;
    };
    DependenciesEngine.prototype.getDirectives = function () {
        return this.directives;
    };
    DependenciesEngine.prototype.getInjectables = function () {
        return this.injectables;
    };
    DependenciesEngine.prototype.getInterfaces = function () {
        return this.interfaces;
    };
    DependenciesEngine.prototype.getRoutes = function () {
        return this.routes;
    };
    DependenciesEngine.prototype.getPipes = function () {
        return this.pipes;
    };
    DependenciesEngine.prototype.getClasses = function () {
        return this.classes;
    };
    DependenciesEngine.prototype.getMiscellaneous = function () {
        return this.miscellaneous;
    };
    DependenciesEngine._instance = new DependenciesEngine();
    return DependenciesEngine;
}());

var $dependenciesEngine = DependenciesEngine.getInstance();

function extractLeadingText(string, completeTag) {
    var tagIndex = string.indexOf(completeTag);
    var leadingText = null;
    var leadingTextRegExp = /\[(.+?)\]/g;
    var leadingTextInfo = leadingTextRegExp.exec(string);
    // did we find leading text, and if so, does it immediately precede the tag?
    while (leadingTextInfo && leadingTextInfo.length) {
        if (leadingTextInfo.index + leadingTextInfo[0].length === tagIndex) {
            string = string.replace(leadingTextInfo[0], '');
            leadingText = leadingTextInfo[1];
            break;
        }
        leadingTextInfo = leadingTextRegExp.exec(string);
    }
    return {
        leadingText: leadingText,
        string: string
    };
}
function splitLinkText(text) {
    var linkText;
    var target;
    var splitIndex;
    // if a pipe is not present, we split on the first space
    splitIndex = text.indexOf('|');
    if (splitIndex === -1) {
        splitIndex = text.search(/\s/);
    }
    if (splitIndex !== -1) {
        linkText = text.substr(splitIndex + 1);
        // Normalize subsequent newlines to a single space.
        linkText = linkText.replace(/\n+/, ' ');
        target = text.substr(0, splitIndex);
    }
    return {
        linkText: linkText,
        target: target || text
    };
}
var LinkParser = (function () {
    var processTheLink = function (string, tagInfo) {
        var leading = extractLeadingText(string, tagInfo.completeTag), linkText = leading.leadingText || '', split, target, stringtoReplace;
        split = splitLinkText(tagInfo.text);
        target = split.target;
        if (leading.leadingText !== null) {
            stringtoReplace = '[' + leading.leadingText + ']' + tagInfo.completeTag;
        }
        else if (typeof split.linkText !== 'undefined') {
            stringtoReplace = tagInfo.completeTag;
            linkText = split.linkText;
        }
        return string.replace(stringtoReplace, '[' + linkText + '](' + target + ')');
    };
    /**
     * Convert
     * {@link http://www.google.com|Google} or {@link https://github.com GitHub} to [Github](https://github.com)
     */
    var replaceLinkTag = function (str) {
        var tagRegExp = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i'), matches, previousString, tagInfo = [];
        function replaceMatch(replacer, tag, match, text) {
            var matchedTag = {
                completeTag: match,
                tag: tag,
                text: text
            };
            tagInfo.push(matchedTag);
            return replacer(str, matchedTag);
        }
        do {
            matches = tagRegExp.exec(str);
            if (matches) {
                previousString = str;
                str = replaceMatch(processTheLink, 'link', matches[0], matches[1]);
            }
        } while (matches && previousString !== str);
        return {
            newString: str
        };
    };
    var _resolveLinks = function (str) {
        return replaceLinkTag(str).newString;
    };
    return {
        resolveLinks: _resolveLinks
    };
})();

var COMPODOC_DEFAULTS = {
    title: 'Application documentation',
    additionalEntryName: 'Additional documentation',
    additionalEntryPath: 'additional-documentation',
    folder: './documentation/',
    port: 8080,
    theme: 'gitbook',
    base: '/',
    defaultCoverageThreshold: 70,
    toggleMenuItems: ['all'],
    disableSourceCode: false,
    disableGraph: false,
    disableCoverage: false,
    disablePrivateOrInternalSupport: false,
    PAGE_TYPES: {
        ROOT: 'root',
        INTERNAL: 'internal'
    }
};

var _$3 = require('lodash');
var Configuration = (function () {
    function Configuration() {
        this._pages = [];
        this._mainData = {
            output: COMPODOC_DEFAULTS.folder,
            theme: COMPODOC_DEFAULTS.theme,
            extTheme: '',
            serve: false,
            port: COMPODOC_DEFAULTS.port,
            open: false,
            assetsFolder: '',
            documentationMainName: COMPODOC_DEFAULTS.title,
            documentationMainDescription: '',
            base: COMPODOC_DEFAULTS.base,
            hideGenerator: false,
            modules: [],
            readme: false,
            changelog: '',
            contributing: '',
            license: '',
            todo: '',
            markdowns: [],
            additionalPages: [],
            pipes: [],
            classes: [],
            interfaces: [],
            components: [],
            directives: [],
            injectables: [],
            miscellaneous: [],
            routes: [],
            tsconfig: '',
            toggleMenuItems: [],
            includes: '',
            includesName: COMPODOC_DEFAULTS.additionalEntryName,
            includesFolder: COMPODOC_DEFAULTS.additionalEntryPath,
            disableSourceCode: COMPODOC_DEFAULTS.disableSourceCode,
            disableGraph: COMPODOC_DEFAULTS.disableGraph,
            disableCoverage: COMPODOC_DEFAULTS.disableCoverage,
            disablePrivateOrInternalSupport: COMPODOC_DEFAULTS.disablePrivateOrInternalSupport,
            watch: false,
            mainGraph: '',
            coverageTest: false,
            coverageTestThreshold: COMPODOC_DEFAULTS.defaultCoverageThreshold,
            routesLength: 0,
            angularVersion: ''
        };
        if (Configuration._instance) {
            throw new Error('Error: Instantiation failed: Use Configuration.getInstance() instead of new.');
        }
        Configuration._instance = this;
    }
    Configuration.getInstance = function () {
        return Configuration._instance;
    };
    Configuration.prototype.addPage = function (page) {
        this._pages.push(page);
    };
    Configuration.prototype.addAdditionalPage = function (page) {
        this._mainData.additionalPages.push(page);
    };
    Configuration.prototype.resetPages = function () {
        this._pages = [];
    };
    Configuration.prototype.resetAdditionalPages = function () {
        this._mainData.additionalPages = [];
    };
    Configuration.prototype.resetRootMarkdownPages = function () {
        var indexPage = _$3.findIndex(this._pages, { 'name': 'index' });
        this._pages.splice(indexPage, 1);
        indexPage = _$3.findIndex(this._pages, { 'name': 'changelog' });
        this._pages.splice(indexPage, 1);
        indexPage = _$3.findIndex(this._pages, { 'name': 'contributing' });
        this._pages.splice(indexPage, 1);
        indexPage = _$3.findIndex(this._pages, { 'name': 'license' });
        this._pages.splice(indexPage, 1);
        indexPage = _$3.findIndex(this._pages, { 'name': 'todo' });
        this._pages.splice(indexPage, 1);
        this._mainData.markdowns = [];
    };
    Object.defineProperty(Configuration.prototype, "pages", {
        get: function () {
            return this._pages;
        },
        set: function (pages) {
            this._pages = [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "mainData", {
        get: function () {
            return this._mainData;
        },
        set: function (data) {
            Object.assign(this._mainData, data);
        },
        enumerable: true,
        configurable: true
    });
    Configuration._instance = new Configuration();
    return Configuration;
}());

var semver = require('semver');
function cleanVersion(version) {
    return version.replace('~', '')
        .replace('^', '')
        .replace('=', '')
        .replace('<', '')
        .replace('>', '');
}
function getAngularVersionOfProject(packageData) {
    var _result = '';
    if (packageData['dependencies']) {
        var angularCore = packageData['dependencies']['@angular/core'];
        if (angularCore) {
            _result = cleanVersion(angularCore);
        }
    }
    return _result;
}
function isAngularVersionArchived(version) {
    var result;
    try {
        result = semver.compare(version, '2.4.10') <= 0;
    }
    catch (e) { }
    return result;
}
function prefixOfficialDoc(version) {
    return isAngularVersionArchived(version) ? 'v2.' : '';
}

var HtmlEngineHelpers = (function () {
    var init = function () {
        //TODO use this instead : https://github.com/assemble/handlebars-helpers
        Handlebars.registerHelper("compare", function (a, operator, b, options) {
            if (arguments.length < 4) {
                throw new Error('handlebars Helper {{compare}} expects 4 arguments');
            }
            var result;
            switch (operator) {
                case 'indexof':
                    result = (b.indexOf(a) !== -1);
                    break;
                case '===':
                    result = a === b;
                    break;
                case '!==':
                    result = a !== b;
                    break;
                case '>':
                    result = a > b;
                    break;
                default: {
                    throw new Error('helper {{compare}}: invalid operator: `' + operator + '`');
                }
            }
            if (result === false) {
                return options.inverse(this);
            }
            return options.fn(this);
        });
        Handlebars.registerHelper("or", function () {
            var len = arguments.length - 1;
            var options = arguments[len];
            for (var i = 0; i < len; i++) {
                if (arguments[i]) {
                    return options.fn(this);
                }
            }
            return options.inverse(this);
        });
        Handlebars.registerHelper("filterAngular2Modules", function (text, options) {
            var NG2_MODULES = [
                'BrowserModule',
                'FormsModule',
                'HttpModule',
                'RouterModule'
            ], len = NG2_MODULES.length;
            var i = 0, result = false;
            for (i; i < len; i++) {
                if (text.indexOf(NG2_MODULES[i]) > -1) {
                    result = true;
                }
            }
            if (result) {
                return options.fn(this);
            }
            else {
                return options.inverse(this);
            }
        });
        Handlebars.registerHelper("debug", function (optionalValue) {
            console.log("Current Context");
            console.log("====================");
            console.log(this);
            if (optionalValue) {
                console.log("OptionalValue");
                console.log("====================");
                console.log(optionalValue);
            }
        });
        Handlebars.registerHelper('breaklines', function (text) {
            text = Handlebars.Utils.escapeExpression(text);
            text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
            text = text.replace(/ /gm, '&nbsp;');
            text = text.replace(/	/gm, '&nbsp;&nbsp;&nbsp;&nbsp;');
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('clean-paragraph', function (text) {
            text = text.replace(/<p>/gm, '');
            text = text.replace(/<\/p>/gm, '');
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('escapeSimpleQuote', function (text) {
            if (!text)
                return;
            var _text = text.replace(/'/g, "\\'");
            _text = _text.replace(/(\r\n|\n|\r)/gm, '');
            return _text;
        });
        Handlebars.registerHelper('breakComma', function (text) {
            text = Handlebars.Utils.escapeExpression(text);
            text = text.replace(/,/g, ',<br>');
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('modifKind', function (kind) {
            // https://github.com/Microsoft/TypeScript/blob/73ee2feb51c9b7e24a29eb4cee19d7c14b933065/lib/typescript.d.ts#L64
            var _kindText = '';
            switch (kind) {
                case 112:
                    _kindText = 'Private';
                    break;
                case 113:
                    _kindText = 'Protected';
                    break;
                case 114:
                    _kindText = 'Public';
                    break;
                case 115:
                    _kindText = 'Static';
                    break;
            }
            return new Handlebars.SafeString(_kindText);
        });
        Handlebars.registerHelper('modifIcon', function (kind) {
            // https://github.com/Microsoft/TypeScript/blob/73ee2feb51c9b7e24a29eb4cee19d7c14b933065/lib/typescript.d.ts#L64
            var _kindText = '';
            switch (kind) {
                case 112:
                    _kindText = 'lock';
                    break;
                case 113:
                    _kindText = 'circle';
                    break;
                case 115:
                    _kindText = 'square';
                case 83:
                    _kindText = 'export';
                    break;
            }
            return _kindText;
        });
        /**
         * Convert {@link MyClass} to [MyClass](http://localhost:8080/classes/MyClass.html)
         */
        Handlebars.registerHelper('parseDescription', function (description, depth) {
            var tagRegExp = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i'), matches, previousString, tagInfo = [];
            var processTheLink = function (string, tagInfo) {
                var leading = extractLeadingText(string, tagInfo.completeTag), split, result, newLink, rootPath, stringtoReplace;
                split = splitLinkText(tagInfo.text);
                if (typeof split.linkText !== 'undefined') {
                    result = $dependenciesEngine.findInCompodoc(split.target);
                }
                else {
                    result = $dependenciesEngine.findInCompodoc(tagInfo.text);
                }
                if (result) {
                    if (leading.leadingText !== null) {
                        stringtoReplace = '[' + leading.leadingText + ']' + tagInfo.completeTag;
                    }
                    else if (typeof split.linkText !== 'undefined') {
                        stringtoReplace = tagInfo.completeTag;
                    }
                    else {
                        stringtoReplace = tagInfo.completeTag;
                    }
                    if (result.type === 'class')
                        result.type = 'classe';
                    rootPath = '';
                    switch (depth) {
                        case 0:
                            rootPath = './';
                            break;
                        case 1:
                            rootPath = '../';
                            break;
                        case 2:
                            rootPath = '../../';
                            break;
                    }
                    var label = result.name;
                    if (leading.leadingText !== null) {
                        label = leading.leadingText;
                    }
                    if (typeof split.linkText !== 'undefined') {
                        label = split.linkText;
                    }
                    newLink = "<a href=\"" + rootPath + result.type + "s/" + result.name + ".html\">" + label + "</a>";
                    return string.replace(stringtoReplace, newLink);
                }
                else {
                    return string;
                }
            };
            function replaceMatch(replacer, tag, match, text) {
                var matchedTag = {
                    completeTag: match,
                    tag: tag,
                    text: text
                };
                tagInfo.push(matchedTag);
                return replacer(description, matchedTag);
            }
            do {
                matches = tagRegExp.exec(description);
                if (matches) {
                    previousString = description;
                    description = replaceMatch(processTheLink, 'link', matches[0], matches[1]);
                }
            } while (matches && previousString !== description);
            return description;
        });
        Handlebars.registerHelper('relativeURL', function (currentDepth, context) {
            var result = '';
            switch (currentDepth) {
                case 0:
                    result = './';
                    break;
                case 1:
                    result = '../';
                    break;
                case 2:
                    result = '../../';
                    break;
            }
            return result;
        });
        Handlebars.registerHelper('functionSignature', function (method) {
            var args = [], configuration = Configuration.getInstance(), angularDocPrefix = prefixOfficialDoc(configuration.mainData.angularVersion);
            if (method.args) {
                args = method.args.map(function (arg) {
                    var _result = $dependenciesEngine.find(arg.type);
                    if (_result) {
                        if (_result.source === 'internal') {
                            var path$$1 = _result.data.type;
                            if (_result.data.type === 'class')
                                path$$1 = 'classe';
                            return arg.name + ": <a href=\"../" + path$$1 + "s/" + _result.data.name + ".html\">" + arg.type + "</a>";
                        }
                        else {
                            var path$$1 = "https://" + angularDocPrefix + "angular.io/docs/ts/latest/api/" + _result.data.path;
                            return arg.name + ": <a href=\"" + path$$1 + "\" target=\"_blank\">" + arg.type + "</a>";
                        }
                    }
                    else if (arg.dotDotDotToken) {
                        return "..." + arg.name + ": " + arg.type;
                    }
                    else {
                        return arg.name + ": " + arg.type;
                    }
                }).join(', ');
            }
            if (method.name) {
                return method.name + "(" + args + ")";
            }
            else {
                return "(" + args + ")";
            }
        });
        Handlebars.registerHelper('jsdoc-returns-comment', function (jsdocTags, options) {
            var i = 0, len = jsdocTags.length, result;
            for (i; i < len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'returns') {
                        result = jsdocTags[i].comment;
                        break;
                    }
                }
            }
            return result;
        });
        Handlebars.registerHelper('jsdoc-component-example', function (jsdocTags, options) {
            var i = 0, len = jsdocTags.length, tags = [];
            var cleanTag = function (comment) {
                if (comment.charAt(0) === '*') {
                    comment = comment.substring(1, comment.length);
                }
                if (comment.charAt(0) === ' ') {
                    comment = comment.substring(1, comment.length);
                }
                return comment;
            };
            var type = 'html';
            if (options.hash.type) {
                type = options.hash.type;
            }
            function htmlEntities(str) {
                return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            }
            for (i; i < len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'example') {
                        var tag = {};
                        if (jsdocTags[i].comment) {
                            tag.comment = "<pre class=\"line-numbers\"><code class=\"language-" + type + "\">" + htmlEntities(cleanTag(jsdocTags[i].comment)) + "</code></pre>";
                        }
                        tags.push(tag);
                    }
                }
            }
            if (tags.length > 0) {
                this.tags = tags;
                return options.fn(this);
            }
        });
        Handlebars.registerHelper('jsdoc-example', function (jsdocTags, options) {
            var i = 0, len = jsdocTags.length, tags = [];
            for (i; i < len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'example') {
                        var tag = {};
                        if (jsdocTags[i].comment) {
                            tag.comment = jsdocTags[i].comment.replace(/<caption>/g, '<b><i>').replace(/\/caption>/g, '/b></i>');
                        }
                        tags.push(tag);
                    }
                }
            }
            if (tags.length > 0) {
                this.tags = tags;
                return options.fn(this);
            }
        });
        Handlebars.registerHelper('jsdoc-params', function (jsdocTags, options) {
            var i = 0, len = jsdocTags.length, tags = [];
            for (i; i < len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'param') {
                        var tag = {};
                        if (jsdocTags[i].typeExpression && jsdocTags[i].typeExpression.type.name) {
                            tag.type = jsdocTags[i].typeExpression.type.name.text;
                        }
                        if (jsdocTags[i].comment) {
                            tag.comment = jsdocTags[i].comment;
                        }
                        if (jsdocTags[i].name) {
                            tag.name = jsdocTags[i].name.text;
                        }
                        tags.push(tag);
                    }
                }
            }
            if (tags.length >= 1) {
                this.tags = tags;
                return options.fn(this);
            }
        });
        Handlebars.registerHelper('jsdoc-default', function (jsdocTags, options) {
            if (jsdocTags) {
                var i = 0, len = jsdocTags.length, tag = {}, defaultValue = false;
                for (i; i < len; i++) {
                    if (jsdocTags[i].tagName) {
                        if (jsdocTags[i].tagName.text === 'default') {
                            defaultValue = true;
                            if (jsdocTags[i].typeExpression && jsdocTags[i].typeExpression.type.name) {
                                tag.type = jsdocTags[i].typeExpression.type.name.text;
                            }
                            if (jsdocTags[i].comment) {
                                tag.comment = jsdocTags[i].comment;
                            }
                            if (jsdocTags[i].name) {
                                tag.name = jsdocTags[i].name.text;
                            }
                        }
                    }
                }
                if (defaultValue) {
                    this.tag = tag;
                    return options.fn(this);
                }
            }
        });
        Handlebars.registerHelper('linkType', function (name, options) {
            var _result = $dependenciesEngine.find(name), configuration = Configuration.getInstance(), angularDocPrefix = prefixOfficialDoc(configuration.mainData.angularVersion);
            if (_result) {
                this.type = {
                    raw: name
                };
                if (_result.source === 'internal') {
                    if (_result.data.type === 'class')
                        _result.data.type = 'classe';
                    this.type.href = '../' + _result.data.type + 's/' + _result.data.name + '.html';
                    this.type.target = '_self';
                }
                else {
                    this.type.href = "https://" + angularDocPrefix + "angular.io/docs/ts/latest/api/" + _result.data.path;
                    this.type.target = '_blank';
                }
                return options.fn(this);
            }
            else {
                return options.inverse(this);
            }
        });
        Handlebars.registerHelper('indexableSignature', function (method) {
            var args = method.args.map(function (arg) { return arg.name + ": " + arg.type; }).join(', ');
            if (method.name) {
                return method.name + "[" + args + "]";
            }
            else {
                return "[" + args + "]";
            }
        });
        Handlebars.registerHelper('object', function (text) {
            text = JSON.stringify(text);
            text = text.replace(/{"/, '{<br>&nbsp;&nbsp;&nbsp;&nbsp;"');
            text = text.replace(/,"/, ',<br>&nbsp;&nbsp;&nbsp;&nbsp;"');
            text = text.replace(/}$/, '<br>}');
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('isNotToggle', function (type, options) {
            var configuration = Configuration.getInstance(), result = configuration.mainData.toggleMenuItems.indexOf(type);
            if (configuration.mainData.toggleMenuItems.indexOf('all') !== -1) {
                return options.inverse(this);
            }
            else if (result === -1) {
                return options.fn(this);
            }
            else {
                return options.inverse(this);
            }
        });
    };
    return {
        init: init
    };
})();

//import * as helpers from 'handlebars-helpers';
var HtmlEngine = (function () {
    function HtmlEngine() {
        this.cache = {};
        HtmlEngineHelpers.init();
    }
    HtmlEngine.prototype.init = function () {
        var _this = this;
        var partials = [
            'menu',
            'overview',
            'markdown',
            'modules',
            'module',
            'components',
            'component',
            'component-detail',
            'directives',
            'directive',
            'injectables',
            'injectable',
            'pipes',
            'pipe',
            'classes',
            'class',
            'interface',
            'routes',
            'search-results',
            'search-input',
            'link-type',
            'block-method',
            'block-enum',
            'block-property',
            'block-index',
            'block-constructor',
            'coverage-report',
            'miscellaneous',
            'additional-page'
        ], i = 0, len = partials.length, loop = function (resolve$$1, reject) {
            if (i <= len - 1) {
                fs.readFile(path.resolve(__dirname + '/../src/templates/partials/' + partials[i] + '.hbs'), 'utf8', function (err, data) {
                    if (err) {
                        reject();
                    }
                    Handlebars.registerPartial(partials[i], data);
                    i++;
                    loop(resolve$$1, reject);
                });
            }
            else {
                fs.readFile(path.resolve(__dirname + '/../src/templates/page.hbs'), 'utf8', function (err, data) {
                    if (err) {
                        reject('Error during index generation');
                    }
                    else {
                        _this.cache['page'] = data;
                        resolve$$1();
                    }
                });
            }
        };
        return new Promise(function (resolve$$1, reject) {
            loop(resolve$$1, reject);
        });
    };
    HtmlEngine.prototype.render = function (mainData, page) {
        var o = mainData, that = this;
        Object.assign(o, page);
        var template = Handlebars.compile(that.cache['page']), result = template({
            data: o
        });
        return result;
    };
    HtmlEngine.prototype.generateCoverageBadge = function (outputFolder, coverageData) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(__dirname + '/../src/templates/partials/coverage-badge.hbs'), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during coverage badge generation');
                }
                else {
                    var template = Handlebars.compile(data), result = template({
                        data: coverageData
                    });
                    outputFolder = outputFolder.replace(process.cwd(), '');
                    fs.outputFile(path.resolve(process.cwd() + path.sep + outputFolder + path.sep + '/images/coverage-badge.svg'), result, function (err) {
                        if (err) {
                            logger.error('Error during coverage badge file generation ', err);
                            reject(err);
                        }
                        else {
                            resolve$$1();
                        }
                    });
                }
            });
        });
    };
    return HtmlEngine;
}());

var marked$1 = require('marked');
var MarkdownEngine = (function () {
    function MarkdownEngine() {
        var _this = this;
        var renderer = new marked$1.Renderer();
        renderer.code = function (code, language) {
            var highlighted = code;
            if (!language) {
                language = 'none';
            }
            highlighted = _this.escape(code);
            return "<pre class=\"line-numbers\"><code class=\"language-" + language + "\">" + highlighted + "</code></pre>";
        };
        renderer.table = function (header, body) {
            return '<table class="table table-bordered compodoc-table">\n'
                + '<thead>\n'
                + header
                + '</thead>\n'
                + '<tbody>\n'
                + body
                + '</tbody>\n'
                + '</table>\n';
        };
        renderer.image = function (href, title, text) {
            var out = '<img src="' + href + '" alt="' + text + '" class="img-responsive"';
            if (title) {
                out += ' title="' + title + '"';
            }
            out += this.options.xhtml ? '/>' : '>';
            return out;
        };
        marked$1.setOptions({
            renderer: renderer,
            breaks: false
        });
    }
    MarkdownEngine.prototype.get = function (filepath) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(process.cwd() + path.sep + filepath), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during ' + filepath + ' read');
                }
                else {
                    resolve$$1(marked$1(data));
                }
            });
        });
    };
    MarkdownEngine.prototype.getTraditionalMarkdown = function (filepath) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(process.cwd() + path.sep + filepath + '.md'), 'utf8', function (err, data) {
                if (err) {
                    fs.readFile(path.resolve(process.cwd() + path.sep + filepath), 'utf8', function (err, data) {
                        if (err) {
                            reject('Error during ' + filepath + ' read');
                        }
                        else {
                            resolve$$1(marked$1(data));
                        }
                    });
                }
                else {
                    resolve$$1(marked$1(data));
                }
            });
        });
    };
    MarkdownEngine.prototype.getReadmeFile = function () {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(process.cwd() + path.sep + 'README.md'), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during README.md file reading');
                }
                else {
                    resolve$$1(marked$1(data));
                }
            });
        });
    };
    MarkdownEngine.prototype.componentHasReadmeFile = function (file) {
        var dirname$$1 = path.dirname(file), readmeFile = dirname$$1 + path.sep + 'README.md', readmeAlternativeFile = dirname$$1 + path.sep + path.basename(file, '.ts') + '.md';
        return fs.existsSync(readmeFile) || fs.existsSync(readmeAlternativeFile);
    };
    MarkdownEngine.prototype.componentReadmeFile = function (file) {
        var dirname$$1 = path.dirname(file), readmeFile = dirname$$1 + path.sep + 'README.md', readmeAlternativeFile = dirname$$1 + path.sep + path.basename(file, '.ts') + '.md', finalPath = '';
        if (fs.existsSync(readmeFile)) {
            finalPath = readmeFile;
        }
        else {
            finalPath = readmeAlternativeFile;
        }
        return finalPath;
    };
    MarkdownEngine.prototype.hasRootMarkdowns = function () {
        var readmeFile = process.cwd() + path.sep + 'README.md', readmeFileWithoutExtension = process.cwd() + path.sep + 'README', changelogFile = process.cwd() + path.sep + 'CHANGELOG.md', changelogFileWithoutExtension = process.cwd() + path.sep + 'CHANGELOG', licenseFile = process.cwd() + path.sep + 'LICENSE.md', licenseFileWithoutExtension = process.cwd() + path.sep + 'LICENSE', contributingFile = process.cwd() + path.sep + 'CONTRIBUTING.md', contributingFileWithoutExtension = process.cwd() + path.sep + 'CONTRIBUTING', todoFile = process.cwd() + path.sep + 'TODO.md', todoFileWithoutExtension = process.cwd() + path.sep + 'TODO';
        return fs.existsSync(readmeFile) ||
            fs.existsSync(readmeFileWithoutExtension) ||
            fs.existsSync(changelogFile) ||
            fs.existsSync(changelogFileWithoutExtension) ||
            fs.existsSync(licenseFile) ||
            fs.existsSync(licenseFileWithoutExtension) ||
            fs.existsSync(contributingFile) ||
            fs.existsSync(contributingFileWithoutExtension) ||
            fs.existsSync(todoFile) ||
            fs.existsSync(todoFileWithoutExtension);
    };
    MarkdownEngine.prototype.listRootMarkdowns = function () {
        var list = [], readme = 'README', changelog = 'CHANGELOG', contributing = 'CONTRIBUTING', license = 'LICENSE', todo = 'TODO';
        if (fs.existsSync(process.cwd() + path.sep + readme + '.md') || fs.existsSync(process.cwd() + path.sep + readme)) {
            //list.push(readme);
            list.push(readme + '.md');
        }
        if (fs.existsSync(process.cwd() + path.sep + changelog + '.md') || fs.existsSync(process.cwd() + path.sep + changelog)) {
            list.push(changelog);
            list.push(changelog + '.md');
        }
        if (fs.existsSync(process.cwd() + path.sep + contributing + '.md') || fs.existsSync(process.cwd() + path.sep + contributing)) {
            list.push(contributing);
            list.push(contributing + '.md');
        }
        if (fs.existsSync(process.cwd() + path.sep + license + '.md') || fs.existsSync(process.cwd() + path.sep + license)) {
            list.push(license);
            list.push(license + '.md');
        }
        if (fs.existsSync(process.cwd() + path.sep + todo + '.md') || fs.existsSync(process.cwd() + path.sep + todo)) {
            list.push(todo);
            list.push(todo + '.md');
        }
        return list;
    };
    MarkdownEngine.prototype.escape = function (html) {
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/@/g, '&#64;');
    };
    return MarkdownEngine;
}());

var FileEngine = (function () {
    function FileEngine() {
    }
    FileEngine.prototype.get = function (filepath) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(process.cwd() + path.sep + filepath), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during ' + filepath + ' read');
                }
                else {
                    resolve$$1(data);
                }
            });
        });
    };
    return FileEngine;
}());

var ngdCr = require('@compodoc/ngd-core');
var ngdT = require('@compodoc/ngd-transformer');
var _$4 = require('lodash');
var NgdEngine = (function () {
    function NgdEngine() {
    }
    NgdEngine.prototype.renderGraph = function (filepath, outputpath, type, name) {
        return new Promise(function (resolve$$1, reject) {
            ngdCr.logger.silent = false;
            var engine = new ngdT.DotEngine({
                output: outputpath,
                displayLegend: true,
                outputFormats: 'svg'
            });
            if (type === 'f') {
                engine
                    .generateGraph([$dependenciesEngine.getRawModule(name)])
                    .then(function (file) {
                    resolve$$1();
                }, function (error) {
                    reject(error);
                });
            }
            else {
                engine
                    .generateGraph($dependenciesEngine.rawModulesForOverview)
                    .then(function (file) {
                    resolve$$1();
                }, function (error) {
                    reject(error);
                });
            }
        });
    };
    NgdEngine.prototype.readGraph = function (filepath, name) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(filepath), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during graph read ' + name);
                }
                else {
                    resolve$$1(data);
                }
            });
        });
    };
    return NgdEngine;
}());

var lunr = require('lunr');
var cheerio = require('cheerio');
var Entities = require('html-entities').AllHtmlEntities;
var $configuration = Configuration.getInstance();
var Html = new Entities();
var SearchEngine = (function () {
    function SearchEngine() {
        this.documentsStore = {};
    }
    SearchEngine.prototype.getSearchIndex = function () {
        if (!this.searchIndex) {
            this.searchIndex = lunr(function () {
                this.ref('url');
                this.field('title', { boost: 10 });
                this.field('body');
            });
        }
        return this.searchIndex;
    };
    SearchEngine.prototype.indexPage = function (page) {
        var text, $ = cheerio.load(page.rawData);
        text = $('.content').html();
        text = Html.decode(text);
        text = text.replace(/(<([^>]+)>)/ig, '');
        page.url = page.url.replace($configuration.mainData.output, '');
        var doc = {
            url: page.url,
            title: page.infos.context + ' - ' + page.infos.name,
            body: text
        };
        if (!this.documentsStore.hasOwnProperty(doc.url)) {
            this.documentsStore[doc.url] = doc;
            this.getSearchIndex().add(doc);
        }
    };
    SearchEngine.prototype.generateSearchIndexJson = function (outputFolder) {
        var _this = this;
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(__dirname + '/../src/templates/partials/search-index.hbs'), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during search index generation');
                }
                else {
                    var template = Handlebars.compile(data), result = template({
                        index: JSON.stringify(_this.getSearchIndex()),
                        store: JSON.stringify(_this.documentsStore)
                    });
                    outputFolder = outputFolder.replace(process.cwd(), '');
                    fs.outputFile(path.resolve(process.cwd() + path.sep + outputFolder + path.sep + '/js/search/search_index.js'), result, function (err) {
                        if (err) {
                            logger.error('Error during search index file generation ', err);
                            reject(err);
                        }
                        else {
                            resolve$$1();
                        }
                    });
                }
            });
        });
    };
    return SearchEngine;
}());

var carriageReturnLineFeed = '\r\n';
var lineFeed = '\n';
var ts$2 = require('typescript');
var _$6 = require('lodash');
function cleanNameWithoutSpaceAndToLowerCase(name) {
    return name.toLowerCase().replace(/ /g, '-');
}
function detectIndent(str, count, indent) {
    var stripIndent = function (str) {
        var match = str.match(/^[ \t]*(?=\S)/gm);
        if (!match) {
            return str;
        }
        // TODO: use spread operator when targeting Node.js 6
        var indent = Math.min.apply(Math, match.map(function (x) { return x.length; })); // eslint-disable-line
        var re = new RegExp("^[ \\t]{" + indent + "}", 'gm');
        return indent > 0 ? str.replace(re, '') : str;
    }, repeating = function (n, str) {
        str = str === undefined ? ' ' : str;
        if (typeof str !== 'string') {
            throw new TypeError("Expected `input` to be a `string`, got `" + typeof str + "`");
        }
        if (n < 0) {
            throw new TypeError("Expected `count` to be a positive finite number, got `" + n + "`");
        }
        var ret = '';
        do {
            if (n & 1) {
                ret += str;
            }
            str += str;
        } while ((n >>= 1));
        return ret;
    }, indentString = function (str, count, indent) {
        indent = indent === undefined ? ' ' : indent;
        count = count === undefined ? 1 : count;
        if (typeof str !== 'string') {
            throw new TypeError("Expected `input` to be a `string`, got `" + typeof str + "`");
        }
        if (typeof count !== 'number') {
            throw new TypeError("Expected `count` to be a `number`, got `" + typeof count + "`");
        }
        if (typeof indent !== 'string') {
            throw new TypeError("Expected `indent` to be a `string`, got `" + typeof indent + "`");
        }
        if (count === 0) {
            return str;
        }
        indent = count > 1 ? repeating(count, indent) : indent;
        return str.replace(/^(?!\s*$)/mg, indent);
    };
    return indentString(stripIndent(str), count || 0, indent);
}
// Create a compilerHost object to allow the compiler to read and write files
function compilerHost(transpileOptions) {
    var inputFileName = transpileOptions.fileName || (transpileOptions.jsx ? 'module.tsx' : 'module.ts');
    var compilerHost = {
        getSourceFile: function (fileName) {
            if (fileName.lastIndexOf('.ts') !== -1) {
                if (fileName === 'lib.d.ts') {
                    return undefined;
                }
                if (fileName.substr(-5) === '.d.ts') {
                    return undefined;
                }
                if (path.isAbsolute(fileName) === false) {
                    fileName = path.join(transpileOptions.tsconfigDirectory, fileName);
                }
                if (!fs.existsSync(fileName)) {
                    return undefined;
                }
                var libSource = '';
                try {
                    libSource = fs.readFileSync(fileName).toString();
                }
                catch (e) {
                    logger.debug(e, fileName);
                }
                return ts$2.createSourceFile(fileName, libSource, transpileOptions.target, false);
            }
            return undefined;
        },
        writeFile: function (name, text) { },
        getDefaultLibFileName: function () { return 'lib.d.ts'; },
        useCaseSensitiveFileNames: function () { return false; },
        getCanonicalFileName: function (fileName) { return fileName; },
        getCurrentDirectory: function () { return ''; },
        getNewLine: function () { return '\n'; },
        fileExists: function (fileName) { return fileName === inputFileName; },
        readFile: function () { return ''; },
        directoryExists: function () { return true; },
        getDirectories: function () { return []; }
    };
    return compilerHost;
}
function findMainSourceFolder(files) {
    var mainFolder = '', mainFolderCount = 0, rawFolders = files.map(function (filepath) {
        var shortPath = filepath.replace(process.cwd() + path.sep, '');
        return path.dirname(shortPath);
    }), folders = {}, i = 0;
    rawFolders = _$6.uniq(rawFolders);
    var len = rawFolders.length;
    for (i; i < len; i++) {
        var sep$$1 = rawFolders[i].split(path.sep);
        sep$$1.map(function (folder) {
            if (folders[folder]) {
                folders[folder] += 1;
            }
            else {
                folders[folder] = 1;
            }
        });
    }
    for (var f in folders) {
        if (folders[f] > mainFolderCount) {
            mainFolderCount = folders[f];
            mainFolder = f;
        }
    }
    return mainFolder;
}

var JSON5 = require('json5');
var _$7 = require('lodash');
var RouterParser = (function () {
    var routes = [], incompleteRoutes = [], modules = [], modulesTree, rootModule, cleanModulesTree, modulesWithRoutes = [], _addRoute = function (route) {
        routes.push(route);
        routes = _$7.sortBy(_$7.uniqWith(routes, _$7.isEqual), ['name']);
    }, _addIncompleteRoute = function (route) {
        incompleteRoutes.push(route);
        incompleteRoutes = _$7.sortBy(_$7.uniqWith(incompleteRoutes, _$7.isEqual), ['name']);
    }, _addModuleWithRoutes = function (moduleName, moduleImports, filename) {
        modulesWithRoutes.push({
            name: moduleName,
            importsNode: moduleImports,
            filename: filename
        });
        modulesWithRoutes = _$7.sortBy(_$7.uniqWith(modulesWithRoutes, _$7.isEqual), ['name']);
    }, _addModule = function (moduleName, moduleImports) {
        modules.push({
            name: moduleName,
            importsNode: moduleImports
        });
        modules = _$7.sortBy(_$7.uniqWith(modules, _$7.isEqual), ['name']);
    }, _cleanRawRouteParsed = function (route) {
        var routesWithoutSpaces = route.replace(/ /gm, ''), testTrailingComma = routesWithoutSpaces.indexOf('},]');
        if (testTrailingComma != -1) {
            routesWithoutSpaces = routesWithoutSpaces.replace('},]', '}]');
        }
        return JSON5.parse(routesWithoutSpaces);
    }, _cleanRawRoute = function (route) {
        var routesWithoutSpaces = route.replace(/ /gm, ''), testTrailingComma = routesWithoutSpaces.indexOf('},]');
        if (testTrailingComma != -1) {
            routesWithoutSpaces = routesWithoutSpaces.replace('},]', '}]');
        }
        return routesWithoutSpaces;
    }, _setRootModule = function (module) {
        rootModule = module;
    }, _hasRouterModuleInImports = function (imports) {
        var result = false, i = 0, len = imports.length;
        for (i; i < len; i++) {
            if (imports[i].name.indexOf('RouterModule.forChild') !== -1 ||
                imports[i].name.indexOf('RouterModule.forRoot') !== -1) {
                result = true;
            }
        }
        return result;
    }, _fixIncompleteRoutes = function (miscellaneousVariables) {
        /*console.log('fixIncompleteRoutes');
        console.log('');
        console.log(routes);
        console.log('');*/
        //console.log(miscellaneousVariables);
        //console.log('');
        var i = 0, len = incompleteRoutes.length, matchingVariables = [];
        // For each incompleteRoute, scan if one misc variable is in code
        // if ok, try recreating complete route
        for (i; i < len; i++) {
            var j = 0, leng = miscellaneousVariables.length;
            for (j; j < leng; j++) {
                if (incompleteRoutes[i].data.indexOf(miscellaneousVariables[j].name) !== -1) {
                    console.log('found one misc var inside incompleteRoute');
                    console.log(miscellaneousVariables[j].name);
                    matchingVariables.push(miscellaneousVariables[j]);
                }
            }
            //Clean incompleteRoute
            incompleteRoutes[i].data = incompleteRoutes[i].data.replace('[', '');
            incompleteRoutes[i].data = incompleteRoutes[i].data.replace(']', '');
        }
        /*console.log(incompleteRoutes);
        console.log('');
        console.log(matchingVariables);
        console.log('');*/
    }, _linkModulesAndRoutes = function () {
        /*console.log('');
        console.log('linkModulesAndRoutes: ');
        //scan each module imports AST for each routes, and link routes with module
        console.log('linkModulesAndRoutes routes: ', routes);
        console.log('');*/
        var i = 0, len = modulesWithRoutes.length;
        for (i; i < len; i++) {
            _$7.forEach(modulesWithRoutes[i].importsNode, function (node) {
                if (node.initializer) {
                    if (node.initializer.elements) {
                        _$7.forEach(node.initializer.elements, function (element) {
                            //find element with arguments
                            if (element.arguments) {
                                _$7.forEach(element.arguments, function (argument) {
                                    _$7.forEach(routes, function (route) {
                                        if (argument.text && route.name === argument.text && route.filename === modulesWithRoutes[i].filename) {
                                            route.module = modulesWithRoutes[i].name;
                                        }
                                    });
                                });
                            }
                        });
                    }
                }
            });
        }
        /*console.log('');
        console.log('end linkModulesAndRoutes: ');
        console.log(util.inspect(routes, { depth: 10 }));
        console.log('');*/
    }, foundRouteWithModuleName = function (moduleName) {
        return _$7.find(routes, { 'module': moduleName });
    }, foundLazyModuleWithPath = function (path$$1) {
        //path is like app/customers/customers.module#CustomersModule
        var split = path$$1.split('#'), lazyModulePath = split[0], lazyModuleName = split[1];
        return lazyModuleName;
    }, _constructRoutesTree = function () {
        //console.log('');
        /*console.log('constructRoutesTree modules: ', modules);
        console.log('');
        console.log('constructRoutesTree modulesWithRoutes: ', modulesWithRoutes);
        console.log('');
        console.log('constructRoutesTree modulesTree: ', util.inspect(modulesTree, { depth: 10 }));
        console.log('');*/
        // routes[] contains routes with module link
        // modulesTree contains modules tree
        // make a final routes tree with that
        cleanModulesTree = _$7.cloneDeep(modulesTree);
        var modulesCleaner = function (arr) {
            for (var i in arr) {
                if (arr[i].importsNode) {
                    delete arr[i].importsNode;
                }
                if (arr[i].parent) {
                    delete arr[i].parent;
                }
                if (arr[i].children) {
                    modulesCleaner(arr[i].children);
                }
            }
        };
        modulesCleaner(cleanModulesTree);
        //console.log('');
        //console.log('  cleanModulesTree light: ', util.inspect(cleanModulesTree, { depth: 10 }));
        //console.log('');
        //console.log(routes);
        //console.log('');
        var routesTree = {
            name: '<root>',
            kind: 'module',
            className: rootModule,
            children: []
        };
        var loopModulesParser = function (node) {
            if (node.children && node.children.length > 0) {
                //If module has child modules
                //console.log('   If module has child modules');
                for (var i in node.children) {
                    var route = foundRouteWithModuleName(node.children[i].name);
                    if (route && route.data) {
                        route.children = JSON5.parse(route.data);
                        delete route.data;
                        route.kind = 'module';
                        routesTree.children.push(route);
                    }
                    if (node.children[i].children) {
                        loopModulesParser(node.children[i]);
                    }
                }
            }
            else {
                //else routes are directly inside the module
                //console.log('   else routes are directly inside the root module');
                var rawRoutes = foundRouteWithModuleName(node.name);
                if (rawRoutes) {
                    var routes_1 = JSON5.parse(rawRoutes.data);
                    if (routes_1) {
                        var i_1 = 0, len = routes_1.length;
                        for (i_1; i_1 < len; i_1++) {
                            var route = routes_1[i_1];
                            if (routes_1[i_1].component) {
                                routesTree.children.push({
                                    kind: 'component',
                                    component: routes_1[i_1].component,
                                    path: routes_1[i_1].path
                                });
                            }
                        }
                    }
                }
            }
        };
        //console.log('');
        //console.log('  rootModule: ', rootModule);
        //console.log('');
        var startModule = _$7.find(cleanModulesTree, { 'name': rootModule });
        if (startModule) {
            loopModulesParser(startModule);
            //Loop twice for routes with lazy loading
            //loopModulesParser(routesTree);
        }
        /*console.log('');
        console.log('  routesTree: ', routesTree);
        console.log('');*/
        var cleanedRoutesTree = null;
        var cleanRoutesTree = function (route) {
            for (var i in route.children) {
                var routes = route.children[i].routes;
            }
            return route;
        };
        cleanedRoutesTree = cleanRoutesTree(routesTree);
        //Try updating routes with lazy loading
        //console.log('');
        //console.log('Try updating routes with lazy loading');
        var loopRoutesParser = function (route) {
            if (route.children) {
                var _loop_1 = function () {
                    if (route.children[i].loadChildren) {
                        var child = foundLazyModuleWithPath(route.children[i].loadChildren), module = _$7.find(cleanModulesTree, { 'name': child });
                        if (module) {
                            var _rawModule_1 = {};
                            _rawModule_1.kind = 'module';
                            _rawModule_1.children = [];
                            _rawModule_1.module = module.name;
                            var loopInside = function (mod) {
                                if (mod.children) {
                                    for (var i in mod.children) {
                                        var route_1 = foundRouteWithModuleName(mod.children[i].name);
                                        if (typeof route_1 !== 'undefined') {
                                            if (route_1.data) {
                                                route_1.children = JSON5.parse(route_1.data);
                                                delete route_1.data;
                                                route_1.kind = 'module';
                                                _rawModule_1.children[i] = route_1;
                                            }
                                        }
                                    }
                                }
                            };
                            loopInside(module);
                            route.children[i].children = [];
                            route.children[i].children.push(_rawModule_1);
                        }
                    }
                    loopRoutesParser(route.children[i]);
                };
                for (var i in route.children) {
                    _loop_1();
                }
            }
        };
        loopRoutesParser(cleanedRoutesTree);
        //console.log('');
        //console.log('  cleanedRoutesTree: ', util.inspect(cleanedRoutesTree, { depth: 10 }));
        return cleanedRoutesTree;
    }, _constructModulesTree = function () {
        //console.log('');
        //console.log('constructModulesTree');
        var getNestedChildren = function (arr, parent) {
            var out = [];
            for (var i in arr) {
                if (arr[i].parent === parent) {
                    var children = getNestedChildren(arr, arr[i].name);
                    if (children.length) {
                        arr[i].children = children;
                    }
                    out.push(arr[i]);
                }
            }
            return out;
        };
        //Scan each module and add parent property
        _$7.forEach(modules, function (firstLoopModule) {
            _$7.forEach(firstLoopModule.importsNode, function (importNode) {
                _$7.forEach(modules, function (module) {
                    if (module.name === importNode.name) {
                        module.parent = firstLoopModule.name;
                    }
                });
            });
        });
        modulesTree = getNestedChildren(modules);
        /*console.log('');
        console.log('end constructModulesTree');
        console.log(modulesTree);*/
    }, _generateRoutesIndex = function (outputFolder, routes) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(__dirname + '/../src/templates/partials/routes-index.hbs'), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during routes index generation');
                }
                else {
                    var template = Handlebars.compile(data), result = template({
                        routes: JSON.stringify(routes)
                    });
                    outputFolder = outputFolder.replace(process.cwd(), '');
                    fs.outputFile(path.resolve(process.cwd() + path.sep + outputFolder + path.sep + '/js/routes/routes_index.js'), result, function (err) {
                        if (err) {
                            logger.error('Error during routes index file generation ', err);
                            reject(err);
                        }
                        else {
                            resolve$$1();
                        }
                    });
                }
            });
        });
    }, _routesLength = function () {
        var _n = 0;
        var routesParser = function (route) {
            if (typeof route.path !== 'undefined') {
                _n += 1;
            }
            if (route.children) {
                for (var j in route.children) {
                    routesParser(route.children[j]);
                }
            }
        };
        for (var i in routes) {
            routesParser(routes[i]);
        }
        return _n;
    };
    return {
        incompleteRoutes: incompleteRoutes,
        addRoute: _addRoute,
        addIncompleteRoute: _addIncompleteRoute,
        addModuleWithRoutes: _addModuleWithRoutes,
        addModule: _addModule,
        cleanRawRouteParsed: _cleanRawRouteParsed,
        cleanRawRoute: _cleanRawRoute,
        setRootModule: _setRootModule,
        printRoutes: function () {
            console.log('');
            console.log('printRoutes: ');
            console.log(routes);
        },
        printModulesRoutes: function () {
            console.log('');
            console.log('printModulesRoutes: ');
            console.log(modulesWithRoutes);
        },
        routesLength: _routesLength,
        hasRouterModuleInImports: _hasRouterModuleInImports,
        fixIncompleteRoutes: _fixIncompleteRoutes,
        linkModulesAndRoutes: _linkModulesAndRoutes,
        constructRoutesTree: _constructRoutesTree,
        constructModulesTree: _constructModulesTree,
        generateRoutesIndex: _generateRoutesIndex
    };
})();

var ts$3 = require('typescript');
function isVariableLike(node) {
    if (node) {
        switch (node.kind) {
            case ts$3.SyntaxKind.BindingElement:
            case ts$3.SyntaxKind.EnumMember:
            case ts$3.SyntaxKind.Parameter:
            case ts$3.SyntaxKind.PropertyAssignment:
            case ts$3.SyntaxKind.PropertyDeclaration:
            case ts$3.SyntaxKind.PropertySignature:
            case ts$3.SyntaxKind.ShorthandPropertyAssignment:
            case ts$3.SyntaxKind.VariableDeclaration:
                return true;
        }
    }
    return false;
}
function some(array, predicate) {
    if (array) {
        if (predicate) {
            for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
                var v = array_1[_i];
                if (predicate(v)) {
                    return true;
                }
            }
        }
        else {
            return array.length > 0;
        }
    }
    return false;
}
function concatenate(array1, array2) {
    if (!some(array2))
        return array1;
    if (!some(array1))
        return array2;
    return array1.concat(array2);
}
function isParameter(node) {
    return node.kind === ts$3.SyntaxKind.Parameter;
}
function getJSDocParameterTags(param) {
    if (!isParameter(param)) {
        return undefined;
    }
    var func = param.parent;
    var tags = getJSDocTags(func, ts$3.SyntaxKind.JSDocParameterTag);
    if (!param.name) {
        // this is an anonymous jsdoc param from a `function(type1, type2): type3` specification
        var i = func.parameters.indexOf(param);
        var paramTags = filter(tags, function (tag) { return tag.kind === ts$3.SyntaxKind.JSDocParameterTag; });
        if (paramTags && 0 <= i && i < paramTags.length) {
            return [paramTags[i]];
        }
    }
    else if (param.name.kind === ts$3.SyntaxKind.Identifier) {
        var name_1 = param.name.text;
        return filter(tags, function (tag) { return tag.kind === ts$3.SyntaxKind.JSDocParameterTag && tag.parameterName.text === name_1; });
    }
    else {
        // TODO: it's a destructured parameter, so it should look up an "object type" series of multiple lines
        // But multi-line object types aren't supported yet either
        return undefined;
    }
}
var JSDocTagsParser = (function () {
    var _getJSDocs = function (node) {
        //console.log('getJSDocs: ', node);
        var cache = node.jsDocCache;
        if (!cache) {
            getJSDocsWorker(node);
            node.jsDocCache = cache;
        }
        return cache;
        function getJSDocsWorker(node) {
            var parent = node.parent;
            // Try to recognize this pattern when node is initializer of variable declaration and JSDoc comments are on containing variable statement.
            // /**
            //   * @param {number} name
            //   * @returns {number}
            //   */
            // var x = function(name) { return name.length; }
            var isInitializerOfVariableDeclarationInStatement = isVariableLike(parent) &&
                parent.initializer === node &&
                parent.parent.parent.kind === ts$3.SyntaxKind.VariableStatement;
            var isVariableOfVariableDeclarationStatement = isVariableLike(node) &&
                parent.parent.kind === ts$3.SyntaxKind.VariableStatement;
            var variableStatementNode = isInitializerOfVariableDeclarationInStatement ? parent.parent.parent :
                isVariableOfVariableDeclarationStatement ? parent.parent :
                    undefined;
            if (variableStatementNode) {
                getJSDocsWorker(variableStatementNode);
            }
            // Also recognize when the node is the RHS of an assignment expression
            var isSourceOfAssignmentExpressionStatement = parent && parent.parent &&
                parent.kind === ts$3.SyntaxKind.BinaryExpression &&
                parent.operatorToken.kind === ts$3.SyntaxKind.EqualsToken &&
                parent.parent.kind === ts$3.SyntaxKind.ExpressionStatement;
            if (isSourceOfAssignmentExpressionStatement) {
                getJSDocsWorker(parent.parent);
            }
            var isModuleDeclaration = node.kind === ts$3.SyntaxKind.ModuleDeclaration &&
                parent && parent.kind === ts$3.SyntaxKind.ModuleDeclaration;
            var isPropertyAssignmentExpression = parent && parent.kind === ts$3.SyntaxKind.PropertyAssignment;
            if (isModuleDeclaration || isPropertyAssignmentExpression) {
                getJSDocsWorker(parent);
            }
            // Pull parameter comments from declaring function as well
            if (node.kind === ts$3.SyntaxKind.Parameter) {
                cache = concatenate(cache, getJSDocParameterTags(node));
            }
            if (isVariableLike(node) && node.initializer) {
                cache = concatenate(cache, node.initializer.jsDoc);
            }
            cache = concatenate(cache, node.jsDoc);
        }
    };
    return {
        getJSDocs: _getJSDocs
    };
})();

var AngularLifecycleHooks;
(function (AngularLifecycleHooks) {
    AngularLifecycleHooks[AngularLifecycleHooks["ngOnChanges"] = 0] = "ngOnChanges";
    AngularLifecycleHooks[AngularLifecycleHooks["ngOnInit"] = 1] = "ngOnInit";
    AngularLifecycleHooks[AngularLifecycleHooks["ngDoCheck"] = 2] = "ngDoCheck";
    AngularLifecycleHooks[AngularLifecycleHooks["ngAfterContentInit"] = 3] = "ngAfterContentInit";
    AngularLifecycleHooks[AngularLifecycleHooks["ngAfterContentChecked"] = 4] = "ngAfterContentChecked";
    AngularLifecycleHooks[AngularLifecycleHooks["ngAfterViewInit"] = 5] = "ngAfterViewInit";
    AngularLifecycleHooks[AngularLifecycleHooks["ngAfterViewChecked"] = 6] = "ngAfterViewChecked";
    AngularLifecycleHooks[AngularLifecycleHooks["ngOnDestroy"] = 7] = "ngOnDestroy";
})(AngularLifecycleHooks || (AngularLifecycleHooks = {}));

var ts$4 = require('typescript');
var getCurrentDirectory = ts$4.sys.getCurrentDirectory;
var useCaseSensitiveFileNames = ts$4.sys.useCaseSensitiveFileNames;
var newLine = ts$4.sys.newLine;
var marked$3 = require('marked');
var _$8 = require('lodash');
function getNewLine() {
    return newLine;
}
function getCanonicalFileName(fileName) {
    return useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
}
var formatDiagnosticsHost = {
    getCurrentDirectory: getCurrentDirectory,
    getCanonicalFileName: getCanonicalFileName,
    getNewLine: getNewLine
};
function markedtags(tags) {
    var mtags = tags;
    _$8.forEach(mtags, function (tag) {
        tag.comment = marked$3(LinkParser.resolveLinks(tag.comment));
    });
    return mtags;
}

function readConfig(configFile) {
    var result = ts$4.readConfigFile(configFile, ts$4.sys.readFile);
    if (result.error) {
        var message = ts$4.formatDiagnostics([result.error], formatDiagnosticsHost);
        throw new Error(message);
    }
    return result.config;
}

function stripBom(source) {
    if (source.charCodeAt(0) === 0xFEFF) {
        return source.slice(1);
    }
    return source;
}
function hasBom(source) {
    return (source.charCodeAt(0) === 0xFEFF);
}
function handlePath(files, cwd) {
    var _files = files, i = 0, len = files.length;
    for (i; i < len; i++) {
        if (files[i].indexOf(cwd) === -1) {
            files[i] = path.resolve(cwd + path.sep + files[i]);
        }
    }
    return _files;
}
function cleanLifecycleHooksFromMethods(methods) {
    var result = [], i = 0, len = methods.length;
    for (i; i < len; i++) {
        if (!methods[i].name in AngularLifecycleHooks) {
            console.log('clean');
            result.push(methods[i]);
        }
    }
    return result;
}

var ts$5 = require('typescript');
function kindToType(kind) {
    var _type = '';
    switch (kind) {
        case ts$5.SyntaxKind.StringKeyword:
            _type = 'string';
            break;
        case ts$5.SyntaxKind.NumberKeyword:
            _type = 'number';
            break;
        case ts$5.SyntaxKind.ArrayType:
            _type = '[]';
            break;
        case ts$5.SyntaxKind.VoidKeyword:
            _type = 'void';
            break;
        case ts$5.SyntaxKind.BooleanKeyword:
            _type = 'boolean';
            break;
        case ts$5.SyntaxKind.AnyKeyword:
            _type = 'any';
            break;
        case ts$5.SyntaxKind.NeverKeyword:
            _type = 'never';
            break;
        case ts$5.SyntaxKind.ObjectKeyword:
            _type = 'object';
            break;
    }
    return _type;
}

var ts$6 = require('typescript');
var code = [];
var gen = (function () {
    var tmp = [];
    return function (token) {
        if (token === void 0) { token = null; }
        if (!token) {
            //console.log(' ! token');
            return code;
        }
        else if (token === '\n') {
            //console.log(' \n');
            code.push(tmp.join(''));
            tmp = [];
        }
        else {
            code.push(token);
        }
        return code;
    };
}());
function generate(node) {
    code = [];
    visitAndRecognize(node);
    return code.join('');
}
function visitAndRecognize(node, depth) {
    if (depth === void 0) { depth = 0; }
    recognize(node);
    depth++;
    node.getChildren().forEach(function (c) { return visitAndRecognize(c, depth); });
}
function recognize(node) {
    //console.log('recognizing...', ts.SyntaxKind[node.kind+'']);
    switch (node.kind) {
        case ts$6.SyntaxKind.FirstLiteralToken:
        case ts$6.SyntaxKind.Identifier:
            gen('\"');
            gen(node.text);
            gen('\"');
            break;
        case ts$6.SyntaxKind.StringLiteral:
            gen('\"');
            gen(node.text);
            gen('\"');
            break;
        case ts$6.SyntaxKind.ArrayLiteralExpression:
            break;
        case ts$6.SyntaxKind.ImportKeyword:
            gen('import');
            gen(' ');
            break;
        case ts$6.SyntaxKind.FromKeyword:
            gen('from');
            gen(' ');
            break;
        case ts$6.SyntaxKind.ExportKeyword:
            gen('\n');
            gen('export');
            gen(' ');
            break;
        case ts$6.SyntaxKind.ClassKeyword:
            gen('class');
            gen(' ');
            break;
        case ts$6.SyntaxKind.ThisKeyword:
            gen('this');
            break;
        case ts$6.SyntaxKind.ConstructorKeyword:
            gen('constructor');
            break;
        case ts$6.SyntaxKind.FalseKeyword:
            gen('false');
            break;
        case ts$6.SyntaxKind.TrueKeyword:
            gen('true');
            break;
        case ts$6.SyntaxKind.NullKeyword:
            gen('null');
            break;
        case ts$6.SyntaxKind.AtToken:
            break;
        case ts$6.SyntaxKind.PlusToken:
            gen('+');
            break;
        case ts$6.SyntaxKind.EqualsGreaterThanToken:
            gen(' => ');
            break;
        case ts$6.SyntaxKind.OpenParenToken:
            gen('(');
            break;
        case ts$6.SyntaxKind.ImportClause:
        case ts$6.SyntaxKind.ObjectLiteralExpression:
            gen('{');
            gen(' ');
            break;
        case ts$6.SyntaxKind.Block:
            gen('{');
            gen('\n');
            break;
        case ts$6.SyntaxKind.CloseBraceToken:
            gen('}');
            break;
        case ts$6.SyntaxKind.CloseParenToken:
            gen(')');
            break;
        case ts$6.SyntaxKind.OpenBracketToken:
            gen('[');
            break;
        case ts$6.SyntaxKind.CloseBracketToken:
            gen(']');
            break;
        case ts$6.SyntaxKind.SemicolonToken:
            gen(';');
            gen('\n');
            break;
        case ts$6.SyntaxKind.CommaToken:
            gen(',');
            gen(' ');
            break;
        case ts$6.SyntaxKind.ColonToken:
            gen(' ');
            gen(':');
            gen(' ');
            break;
        case ts$6.SyntaxKind.DotToken:
            gen('.');
            break;
        case ts$6.SyntaxKind.DoStatement:
            break;
        case ts$6.SyntaxKind.Decorator:
            break;
        case ts$6.SyntaxKind.FirstAssignment:
            gen(' = ');
            break;
        case ts$6.SyntaxKind.FirstPunctuation:
            gen(' ');
            break;
        case ts$6.SyntaxKind.PrivateKeyword:
            gen('private');
            gen(' ');
            break;
        case ts$6.SyntaxKind.PublicKeyword:
            gen('public');
            gen(' ');
            break;
        default:
            break;
    }
}

var $ = require('cheerio');
var _$9 = require('lodash');
var ComponentsTreeEngine = (function () {
    function ComponentsTreeEngine() {
        this.components = [];
        this.componentsForTree = [];
        if (ComponentsTreeEngine._instance) {
            throw new Error('Error: Instantiation failed: Use ComponentsTreeEngine.getInstance() instead of new.');
        }
        ComponentsTreeEngine._instance = this;
    }
    ComponentsTreeEngine.getInstance = function () {
        return ComponentsTreeEngine._instance;
    };
    ComponentsTreeEngine.prototype.addComponent = function (component) {
        this.components.push(component);
    };
    ComponentsTreeEngine.prototype.readTemplates = function () {
        var _this = this;
        return new Promise(function (resolve$$1, reject) {
            var i = 0, len = _this.componentsForTree.length, $fileengine = new FileEngine(), loop = function () {
                if (i <= len - 1) {
                    if (_this.componentsForTree[i].templateUrl) {
                        $fileengine.get(path.dirname(_this.componentsForTree[i].file) + path.sep + _this.componentsForTree[i].templateUrl).then(function (templateData) {
                            _this.componentsForTree[i].templateData = templateData;
                            i++;
                            loop();
                        }, function (e) {
                            logger.error(e);
                            reject();
                        });
                    }
                    else {
                        _this.componentsForTree[i].templateData = _this.componentsForTree[i].template;
                        i++;
                        loop();
                    }
                }
                else {
                    resolve$$1();
                }
            };
            loop();
        });
    };
    ComponentsTreeEngine.prototype.findChildrenAndParents = function () {
        var _this = this;
        return new Promise(function (resolve$$1, reject) {
            _$9.forEach(_this.componentsForTree, function (component) {
                var $component = $(component.templateData);
                _$9.forEach(_this.componentsForTree, function (componentToFind) {
                    if ($component.find(componentToFind.selector).length > 0) {
                        console.log(componentToFind.name + ' found in ' + component.name);
                        component.children.push(componentToFind.name);
                    }
                });
            });
            resolve$$1();
        });
    };
    ComponentsTreeEngine.prototype.createTreesForComponents = function () {
        var _this = this;
        return new Promise(function (resolve$$1, reject) {
            _$9.forEach(_this.components, function (component) {
                var _component = {
                    name: component.name,
                    file: component.file,
                    selector: component.selector,
                    children: [],
                    template: '',
                    templateUrl: ''
                };
                if (typeof component.template !== 'undefined') {
                    _component.template = component.template;
                }
                if (component.templateUrl.length > 0) {
                    _component.templateUrl = component.templateUrl[0];
                }
                _this.componentsForTree.push(_component);
            });
            _this.readTemplates().then(function () {
                _this.findChildrenAndParents().then(function () {
                    console.log('this.componentsForTree: ', _this.componentsForTree);
                    resolve$$1();
                }, function (e) {
                    logger.error(e);
                    reject();
                });
            }, function (e) {
                logger.error(e);
            });
        });
    };
    ComponentsTreeEngine._instance = new ComponentsTreeEngine();
    return ComponentsTreeEngine;
}());

var $componentsTreeEngine = ComponentsTreeEngine.getInstance();

var marked$2 = require('marked');
var ts$1 = require('typescript');
var _$5 = require('lodash');
var Dependencies = (function () {
    function Dependencies(files, options) {
        this.__cache = {};
        this.__nsModule = {};
        this.unknown = '???';
        this.configuration = Configuration.getInstance();
        this.getComponentExampleUrls = function (text) {
            var exampleUrlsMatches = text.match(/<example-url>(.*?)<\/example-url>/g);
            var exampleUrls = null;
            if (exampleUrlsMatches && exampleUrlsMatches.length) {
                exampleUrls = exampleUrlsMatches.map(function (val) {
                    return val.replace(/<\/?example-url>/g, '');
                });
            }
            return exampleUrls;
        };
        this.files = files;
        var transpileOptions = {
            target: ts$1.ScriptTarget.ES5,
            module: ts$1.ModuleKind.CommonJS,
            tsconfigDirectory: options.tsconfigDirectory
        };
        this.program = ts$1.createProgram(this.files, transpileOptions, compilerHost(transpileOptions));
        this.typeChecker = this.program.getTypeChecker();
    }
    Dependencies.prototype.getDependencies = function () {
        var _this = this;
        var deps = {
            'modules': [],
            'components': [],
            'injectables': [],
            'pipes': [],
            'directives': [],
            'routes': [],
            'classes': [],
            'interfaces': [],
            'miscellaneous': {
                variables: [],
                functions: [],
                typealiases: [],
                enumerations: [],
                types: []
            }
        };
        var sourceFiles = this.program.getSourceFiles() || [];
        /**
         * Clean files with UTF-8 BOM
         */
        sourceFiles.forEach(function (file, index) {
            var filePath = file.fileName;
            if (path.extname(filePath) === '.ts') {
                if (filePath.lastIndexOf('.d.ts') === -1 && filePath.lastIndexOf('spec.ts') === -1) {
                    if (hasBom(file.text)) {
                        var text = stripBom(file.text), tt = file.update(text, {
                            newLength: text.length,
                            span: {
                                start: 0,
                                length: file.text.length
                            }
                        });
                        if (!tt.moduleAugmentations) {
                            tt.moduleAugmentations = [];
                        }
                        sourceFiles[index] = tt;
                    }
                }
            }
        });
        sourceFiles.map(function (file) {
            var filePath = file.fileName;
            if (path.extname(filePath) === '.ts') {
                if (filePath.lastIndexOf('.d.ts') === -1 && filePath.lastIndexOf('spec.ts') === -1) {
                    logger.info('parsing', filePath);
                    try {
                        _this.getSourceFileDecorators(file, deps);
                    }
                    catch (e) {
                        logger.error(e, file.fileName);
                    }
                }
            }
            return deps;
        });
        // End of file scanning
        // Try merging inside the same file declarated variables & modules with imports | exports | declarations | providers
        if (deps['miscellaneous'].variables.length > 0) {
            deps['miscellaneous'].variables.forEach(function (_variable) {
                var newVar = [];
                (function (_var, _newVar) {
                    // getType pr reconstruire....
                    if (_var.initializer) {
                        if (_var.initializer.elements) {
                            if (_var.initializer.elements.length > 0) {
                                _var.initializer.elements.forEach(function (element) {
                                    if (element.text) {
                                        newVar.push({
                                            name: element.text,
                                            type: _this.getType(element.text)
                                        });
                                    }
                                });
                            }
                        }
                    }
                })(_variable, newVar);
                deps['modules'].forEach(function (mod) {
                    if (mod.file === _variable.file) {
                        var process = function (initialArray, _var) {
                            var indexToClean = 0, found = false;
                            var findVariableInArray = function (el, index, theArray) {
                                if (el.name === _var.name) {
                                    indexToClean = index;
                                    found = true;
                                }
                            };
                            initialArray.forEach(findVariableInArray);
                            // Clean indexes to replace
                            if (found) {
                                initialArray.splice(indexToClean, 1);
                                // Add variable
                                newVar.forEach(function (newEle) {
                                    if (typeof _$5.find(initialArray, { 'name': newEle.name }) === 'undefined') {
                                        initialArray.push(newEle);
                                    }
                                });
                            }
                        };
                        process(mod.imports, _variable);
                        process(mod.exports, _variable);
                        process(mod.declarations, _variable);
                        process(mod.providers, _variable);
                    }
                });
            });
        }
        //RouterParser.printModulesRoutes();
        //RouterParser.printRoutes();
        /*if (RouterParser.incompleteRoutes.length > 0) {
            if (deps['miscellaneous']['variables'].length > 0) {
                RouterParser.fixIncompleteRoutes(deps['miscellaneous']['variables']);
            }
        }*/
        //$componentsTreeEngine.createTreesForComponents();
        RouterParser.linkModulesAndRoutes();
        RouterParser.constructModulesTree();
        deps.routesTree = RouterParser.constructRoutesTree();
        return deps;
    };
    Dependencies.prototype.getSourceFileDecorators = function (srcFile, outputSymbols) {
        var _this = this;
        var cleaner = (process.cwd() + path.sep).replace(/\\/g, '/'), file = srcFile.fileName.replace(cleaner, '');
        ts$1.forEachChild(srcFile, function (node) {
            var deps = {};
            if (node.decorators) {
                var visitNode = function (visitedNode, index) {
                    var metadata = node.decorators;
                    var name = _this.getSymboleName(node);
                    var props = _this.findProps(visitedNode);
                    var IO = _this.getComponentIO(file, srcFile, node);
                    if (_this.isModule(metadata)) {
                        deps = {
                            name: name,
                            file: file,
                            providers: _this.getModuleProviders(props),
                            declarations: _this.getModuleDeclations(props),
                            imports: _this.getModuleImports(props),
                            exports: _this.getModuleExports(props),
                            bootstrap: _this.getModuleBootstrap(props),
                            type: 'module',
                            description: IO.description,
                            sourceCode: srcFile.getText()
                        };
                        if (RouterParser.hasRouterModuleInImports(deps.imports)) {
                            RouterParser.addModuleWithRoutes(name, _this.getModuleImportsRaw(props), file);
                        }
                        RouterParser.addModule(name, deps.imports);
                        outputSymbols['modules'].push(deps);
                    }
                    else if (_this.isComponent(metadata)) {
                        if (props.length === 0)
                            return;
                        //console.log(util.inspect(props, { showHidden: true, depth: 10 }));
                        deps = {
                            name: name,
                            file: file,
                            //animations?: string[]; // TODO
                            changeDetection: _this.getComponentChangeDetection(props),
                            encapsulation: _this.getComponentEncapsulation(props),
                            //entryComponents?: string; // TODO waiting doc infos
                            exportAs: _this.getComponentExportAs(props),
                            host: _this.getComponentHost(props),
                            inputs: _this.getComponentInputsMetadata(props),
                            //interpolation?: string; // TODO waiting doc infos
                            moduleId: _this.getComponentModuleId(props),
                            outputs: _this.getComponentOutputs(props),
                            providers: _this.getComponentProviders(props),
                            //queries?: Deps[]; // TODO
                            selector: _this.getComponentSelector(props),
                            styleUrls: _this.getComponentStyleUrls(props),
                            styles: _this.getComponentStyles(props),
                            template: _this.getComponentTemplate(props),
                            templateUrl: _this.getComponentTemplateUrl(props),
                            viewProviders: _this.getComponentViewProviders(props),
                            inputsClass: IO.inputs,
                            outputsClass: IO.outputs,
                            propertiesClass: IO.properties,
                            methodsClass: IO.methods,
                            description: IO.description,
                            type: 'component',
                            sourceCode: srcFile.getText(),
                            exampleUrls: _this.getComponentExampleUrls(srcFile.getText())
                        };
                        if (_this.configuration.mainData.disablePrivateOrInternalSupport) {
                            deps.methodsClass = cleanLifecycleHooksFromMethods(deps.methodsClass);
                        }
                        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
                            deps.jsdoctags = IO.jsdoctags[0].tags;
                        }
                        if (IO.constructor) {
                            deps.constructorObj = IO.constructor;
                        }
                        if (IO.extends) {
                            deps.extends = IO.extends;
                        }
                        if (IO.implements && IO.implements.length > 0) {
                            deps.implements = IO.implements;
                        }
                        $componentsTreeEngine.addComponent(deps);
                        outputSymbols['components'].push(deps);
                    }
                    else if (_this.isInjectable(metadata)) {
                        deps = {
                            name: name,
                            file: file,
                            type: 'injectable',
                            properties: IO.properties,
                            methods: IO.methods,
                            description: IO.description,
                            sourceCode: srcFile.getText()
                        };
                        if (IO.constructor) {
                            deps.constructorObj = IO.constructor;
                        }
                        outputSymbols['injectables'].push(deps);
                    }
                    else if (_this.isPipe(metadata)) {
                        deps = {
                            name: name,
                            file: file,
                            type: 'pipe',
                            description: IO.description,
                            sourceCode: srcFile.getText()
                        };
                        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
                            deps.jsdoctags = IO.jsdoctags[0].tags;
                        }
                        outputSymbols['pipes'].push(deps);
                    }
                    else if (_this.isDirective(metadata)) {
                        if (props.length === 0)
                            return;
                        deps = {
                            name: name,
                            file: file,
                            type: 'directive',
                            description: IO.description,
                            sourceCode: srcFile.getText(),
                            selector: _this.getComponentSelector(props),
                            providers: _this.getComponentProviders(props),
                            inputsClass: IO.inputs,
                            outputsClass: IO.outputs,
                            propertiesClass: IO.properties,
                            methodsClass: IO.methods,
                            exampleUrls: _this.getComponentExampleUrls(srcFile.getText())
                        };
                        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
                            deps.jsdoctags = IO.jsdoctags[0].tags;
                        }
                        if (IO.implements && IO.implements.length > 0) {
                            deps.implements = IO.implements;
                        }
                        if (IO.constructor) {
                            deps.constructorObj = IO.constructor;
                        }
                        outputSymbols['directives'].push(deps);
                    }
                    _this.debug(deps);
                    _this.__cache[name] = deps;
                };
                var filterByDecorators = function (node) {
                    if (node.expression && node.expression.expression) {
                        return /(NgModule|Component|Injectable|Pipe|Directive)/.test(node.expression.expression.text);
                    }
                    return false;
                };
                node.decorators
                    .filter(filterByDecorators)
                    .forEach(visitNode);
            }
            else if (node.symbol) {
                if (node.symbol.flags === ts$1.SymbolFlags.Class) {
                    var name = _this.getSymboleName(node);
                    var IO = _this.getClassIO(file, srcFile, node);
                    deps = {
                        name: name,
                        file: file,
                        type: 'class',
                        sourceCode: srcFile.getText()
                    };
                    if (IO.constructor) {
                        deps.constructorObj = IO.constructor;
                    }
                    if (IO.properties) {
                        deps.properties = IO.properties;
                    }
                    if (IO.description) {
                        deps.description = IO.description;
                    }
                    if (IO.methods) {
                        deps.methods = IO.methods;
                    }
                    if (IO.extends) {
                        deps.extends = IO.extends;
                    }
                    if (IO.implements && IO.implements.length > 0) {
                        deps.implements = IO.implements;
                    }
                    _this.debug(deps);
                    outputSymbols['classes'].push(deps);
                }
                else if (node.symbol.flags === ts$1.SymbolFlags.Interface) {
                    var name = _this.getSymboleName(node);
                    var IO = _this.getInterfaceIO(file, srcFile, node);
                    deps = {
                        name: name,
                        file: file,
                        type: 'interface',
                        sourceCode: srcFile.getText()
                    };
                    if (IO.properties) {
                        deps.properties = IO.properties;
                    }
                    if (IO.indexSignatures) {
                        deps.indexSignatures = IO.indexSignatures;
                    }
                    if (IO.kind) {
                        deps.kind = IO.kind;
                    }
                    if (IO.description) {
                        deps.description = IO.description;
                    }
                    if (IO.methods) {
                        deps.methods = IO.methods;
                    }
                    _this.debug(deps);
                    outputSymbols['interfaces'].push(deps);
                }
                else if (node.kind === ts$1.SyntaxKind.FunctionDeclaration) {
                    var infos = _this.visitFunctionDeclaration(node), tags = _this.visitFunctionDeclarationJSDocTags(node), name = infos.name;
                    deps = {
                        name: name,
                        file: file,
                        description: _this.visitEnumAndFunctionDeclarationDescription(node)
                    };
                    if (infos.args) {
                        deps.args = infos.args;
                    }
                    if (tags && tags.length > 0) {
                        deps.jsdoctags = tags;
                    }
                    outputSymbols['miscellaneous'].functions.push(deps);
                }
                else if (node.kind === ts$1.SyntaxKind.EnumDeclaration) {
                    var infos = _this.visitEnumDeclaration(node), name = node.name.text;
                    deps = {
                        name: name,
                        childs: infos,
                        description: _this.visitEnumAndFunctionDeclarationDescription(node),
                        file: file
                    };
                    outputSymbols['miscellaneous'].enumerations.push(deps);
                }
            }
            else {
                var IO = _this.getRouteIO(file, srcFile);
                if (IO.routes) {
                    var newRoutes = void 0;
                    try {
                        newRoutes = RouterParser.cleanRawRouteParsed(IO.routes);
                    }
                    catch (e) {
                        logger.error('Routes parsing error, maybe a trailing comma or an external variable, trying to fix that later after sources scanning.');
                        newRoutes = IO.routes.replace(/ /gm, '');
                        RouterParser.addIncompleteRoute({
                            data: newRoutes,
                            file: file
                        });
                        return true;
                    }
                    outputSymbols['routes'] = outputSymbols['routes'].concat(newRoutes);
                }
                if (node.kind === ts$1.SyntaxKind.ClassDeclaration) {
                    var name = _this.getSymboleName(node);
                    var IO_1 = _this.getClassIO(file, srcFile, node);
                    deps = {
                        name: name,
                        file: file,
                        type: 'class',
                        sourceCode: srcFile.getText()
                    };
                    if (IO_1.constructor) {
                        deps.constructorObj = IO_1.constructor;
                    }
                    if (IO_1.properties) {
                        deps.properties = IO_1.properties;
                    }
                    if (IO_1.indexSignatures) {
                        deps.indexSignatures = IO_1.indexSignatures;
                    }
                    if (IO_1.description) {
                        deps.description = IO_1.description;
                    }
                    if (IO_1.methods) {
                        deps.methods = IO_1.methods;
                    }
                    if (IO_1.extends) {
                        deps.extends = IO_1.extends;
                    }
                    if (IO_1.implements && IO_1.implements.length > 0) {
                        deps.implements = IO_1.implements;
                    }
                    _this.debug(deps);
                    outputSymbols['classes'].push(deps);
                }
                if (node.kind === ts$1.SyntaxKind.ExpressionStatement) {
                    var bootstrapModuleReference = 'bootstrapModule';
                    //Find the root module with bootstrapModule call
                    //1. find a simple call : platformBrowserDynamic().bootstrapModule(AppModule);
                    //2. or inside a call :
                    // () => {
                    //     platformBrowserDynamic().bootstrapModule(AppModule);
                    // });
                    //3. with a catch : platformBrowserDynamic().bootstrapModule(AppModule).catch(error => console.error(error));
                    //4. with parameters : platformBrowserDynamic().bootstrapModule(AppModule, {}).catch(error => console.error(error));
                    //Find recusively in expression nodes one with name 'bootstrapModule'
                    var rootModule_1, resultNode = void 0;
                    if (srcFile.text.indexOf(bootstrapModuleReference) !== -1) {
                        if (node.expression) {
                            resultNode = _this.findExpressionByNameInExpressions(node.expression, 'bootstrapModule');
                        }
                        if (!resultNode) {
                            if (node.expression && node.expression.arguments && node.expression.arguments.length > 0) {
                                resultNode = _this.findExpressionByNameInExpressionArguments(node.expression.arguments, 'bootstrapModule');
                            }
                        }
                        if (resultNode) {
                            if (resultNode.arguments.length > 0) {
                                _$5.forEach(resultNode.arguments, function (argument) {
                                    if (argument.text) {
                                        rootModule_1 = argument.text;
                                    }
                                });
                            }
                            if (rootModule_1) {
                                RouterParser.setRootModule(rootModule_1);
                            }
                        }
                    }
                }
                if (node.kind === ts$1.SyntaxKind.VariableStatement && !_this.isVariableRoutes(node)) {
                    var infos = _this.visitVariableDeclaration(node), name = infos.name;
                    deps = {
                        name: name,
                        file: file
                    };
                    deps.type = (infos.type) ? infos.type : '';
                    if (infos.defaultValue) {
                        deps.defaultValue = infos.defaultValue;
                    }
                    if (infos.initializer) {
                        deps.initializer = infos.initializer;
                    }
                    if (node.jsDoc && node.jsDoc.length > 0 && node.jsDoc[0].comment) {
                        deps.description = marked$2(node.jsDoc[0].comment);
                    }
                    outputSymbols['miscellaneous'].variables.push(deps);
                }
                if (node.kind === ts$1.SyntaxKind.TypeAliasDeclaration) {
                    var infos = _this.visitTypeDeclaration(node), name = infos.name;
                    deps = {
                        name: name,
                        file: file
                    };
                    outputSymbols['miscellaneous'].types.push(deps);
                }
                if (node.kind === ts$1.SyntaxKind.FunctionDeclaration) {
                    var infos = _this.visitFunctionDeclaration(node), name = infos.name;
                    deps = {
                        name: name,
                        file: file,
                        description: _this.visitEnumAndFunctionDeclarationDescription(node)
                    };
                    if (infos.args) {
                        deps.args = infos.args;
                    }
                    outputSymbols['miscellaneous'].functions.push(deps);
                }
                if (node.kind === ts$1.SyntaxKind.EnumDeclaration) {
                    var infos = _this.visitEnumDeclaration(node), name = node.name.text;
                    deps = {
                        name: name,
                        childs: infos,
                        description: _this.visitEnumAndFunctionDeclarationDescription(node),
                        file: file
                    };
                    outputSymbols['miscellaneous'].enumerations.push(deps);
                }
            }
        });
    };
    Dependencies.prototype.debug = function (deps) {
        logger.debug('found', "" + deps.name);
        [
            'imports', 'exports', 'declarations', 'providers', 'bootstrap'
        ].forEach(function (symbols) {
            if (deps[symbols] && deps[symbols].length > 0) {
                logger.debug('', "- " + symbols + ":");
                deps[symbols].map(function (i) { return i.name; }).forEach(function (d) {
                    logger.debug('', "\t- " + d);
                });
            }
        });
    };
    Dependencies.prototype.isVariableRoutes = function (node) {
        var result = false;
        if (node.declarationList.declarations) {
            var i = 0, len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                if (node.declarationList.declarations[i].type) {
                    if (node.declarationList.declarations[i].type.typeName && node.declarationList.declarations[i].type.typeName.text === 'Routes') {
                        result = true;
                    }
                }
            }
        }
        return result;
    };
    Dependencies.prototype.findExpressionByNameInExpressions = function (entryNode, name) {
        var result, loop = function (node, name) {
            if (node.expression && !node.expression.name) {
                loop(node.expression, name);
            }
            if (node.expression && node.expression.name) {
                if (node.expression.name.text === name) {
                    result = node;
                }
                else {
                    loop(node.expression, name);
                }
            }
        };
        loop(entryNode, name);
        return result;
    };
    Dependencies.prototype.findExpressionByNameInExpressionArguments = function (arg, name) {
        var result, that = this, i = 0, len = arg.length, loop = function (node, name) {
            if (node.body) {
                if (node.body.statements && node.body.statements.length > 0) {
                    var j = 0, leng = node.body.statements.length;
                    for (j; j < leng; j++) {
                        result = that.findExpressionByNameInExpressions(node.body.statements[j], name);
                    }
                }
            }
        };
        for (i; i < len; i++) {
            loop(arg[i], name);
        }
        return result;
    };
    Dependencies.prototype.parseDecorators = function (decorators, type) {
        var result = false;
        if (decorators.length > 1) {
            _$5.forEach(decorators, function (decorator) {
                if (decorator.expression.expression) {
                    if (decorator.expression.expression.text === type) {
                        result = true;
                    }
                }
            });
        }
        else {
            if (decorators[0].expression.expression) {
                if (decorators[0].expression.expression.text === type) {
                    result = true;
                }
            }
        }
        return result;
    };
    Dependencies.prototype.isComponent = function (metadatas) {
        return this.parseDecorators(metadatas, 'Component');
    };
    Dependencies.prototype.isPipe = function (metadatas) {
        return this.parseDecorators(metadatas, 'Pipe');
    };
    Dependencies.prototype.isDirective = function (metadatas) {
        return this.parseDecorators(metadatas, 'Directive');
    };
    Dependencies.prototype.isInjectable = function (metadatas) {
        return this.parseDecorators(metadatas, 'Injectable');
    };
    Dependencies.prototype.isModule = function (metadatas) {
        return this.parseDecorators(metadatas, 'NgModule');
    };
    Dependencies.prototype.getType = function (name) {
        var type;
        if (name.toLowerCase().indexOf('component') !== -1) {
            type = 'component';
        }
        else if (name.toLowerCase().indexOf('pipe') !== -1) {
            type = 'pipe';
        }
        else if (name.toLowerCase().indexOf('module') !== -1) {
            type = 'module';
        }
        else if (name.toLowerCase().indexOf('directive') !== -1) {
            type = 'directive';
        }
        return type;
    };
    Dependencies.prototype.getSymboleName = function (node) {
        return node.name.text;
    };
    Dependencies.prototype.getComponentSelector = function (props) {
        return this.getSymbolDeps(props, 'selector').pop();
    };
    Dependencies.prototype.getComponentExportAs = function (props) {
        return this.getSymbolDeps(props, 'exportAs').pop();
    };
    Dependencies.prototype.getModuleProviders = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'providers').map(function (providerName) {
            return _this.parseDeepIndentifier(providerName);
        });
    };
    Dependencies.prototype.findProps = function (visitedNode) {
        if (visitedNode.expression.arguments.length > 0) {
            return visitedNode.expression.arguments.pop().properties;
        }
        else {
            return '';
        }
    };
    Dependencies.prototype.getModuleDeclations = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'declarations').map(function (name) {
            var component = _this.findComponentSelectorByName(name);
            if (component) {
                return component;
            }
            return _this.parseDeepIndentifier(name);
        });
    };
    Dependencies.prototype.getModuleImportsRaw = function (props) {
        return this.getSymbolDepsRaw(props, 'imports');
    };
    Dependencies.prototype.getModuleImports = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'imports').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Dependencies.prototype.getModuleExports = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'exports').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Dependencies.prototype.getComponentHost = function (props) {
        return this.getSymbolDepsObject(props, 'host');
    };
    Dependencies.prototype.getModuleBootstrap = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'bootstrap').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Dependencies.prototype.getComponentInputsMetadata = function (props) {
        return this.getSymbolDeps(props, 'inputs');
    };
    Dependencies.prototype.getDecoratorOfType = function (node, decoratorType) {
        var decorators = node.decorators || [];
        for (var i = 0; i < decorators.length; i++) {
            if (decorators[i].expression.expression) {
                if (decorators[i].expression.expression.text === decoratorType) {
                    return decorators[i];
                }
            }
        }
        return null;
    };
    Dependencies.prototype.visitInput = function (property, inDecorator, sourceFile) {
        var inArgs = inDecorator.expression.arguments, _return = {};
        _return.name = (inArgs.length > 0) ? inArgs[0].text : property.name.text;
        _return.defaultValue = property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined;
        if (property.symbol) {
            _return.description = marked$2(LinkParser.resolveLinks(ts$1.displayPartsToString(property.symbol.getDocumentationComment())));
        }
        if (!_return.description) {
            if (property.jsDoc) {
                if (property.jsDoc.length > 0) {
                    if (typeof property.jsDoc[0].comment !== 'undefined') {
                        _return.description = marked$2(property.jsDoc[0].comment);
                    }
                }
            }
        }
        _return.line = this.getPosition(property, sourceFile).line + 1;
        if (property.type) {
            _return.type = this.visitType(property);
        }
        else {
            // handle NewExpression
            if (property.initializer) {
                if (property.initializer.kind === ts$1.SyntaxKind.NewExpression) {
                    if (property.initializer.expression) {
                        _return.type = property.initializer.expression.text;
                    }
                }
            }
        }
        return _return;
    };
    Dependencies.prototype.visitType = function (node) {
        var _return = 'void';
        if (node) {
            if (node.typeName) {
                _return = node.typeName.text;
            }
            else if (node.type) {
                if (node.type.kind) {
                    _return = kindToType(node.type.kind);
                }
                if (node.type.typeName) {
                    _return = node.type.typeName.text;
                }
                if (node.type.typeArguments) {
                    _return += '<';
                    for (var _i = 0, _a = node.type.typeArguments; _i < _a.length; _i++) {
                        var argument = _a[_i];
                        if (argument.kind) {
                            _return += kindToType(argument.kind);
                        }
                        if (argument.typeName) {
                            _return += argument.typeName.text;
                        }
                    }
                    _return += '>';
                }
            }
            else if (node.elementType) {
                _return = kindToType(node.elementType.kind) + kindToType(node.kind);
            }
            else if (node.types && node.kind === ts$1.SyntaxKind.UnionType) {
                _return = '';
                var i = 0, len = node.types.length;
                for (i; i < len; i++) {
                    _return += kindToType(node.types[i].kind);
                    if (i < len - 1) {
                        _return += '|';
                    }
                }
            }
            else if (node.dotDotDotToken) {
                _return = 'any[]';
            }
            else {
                _return = kindToType(node.kind);
            }
            if (node.typeArguments) {
                _return += '<';
                for (var _b = 0, _c = node.typeArguments; _b < _c.length; _b++) {
                    var argument = _c[_b];
                    _return += kindToType(argument.kind);
                }
                _return += '>';
            }
        }
        return _return;
    };
    Dependencies.prototype.visitOutput = function (property, outDecorator, sourceFile) {
        var inArgs = outDecorator.expression.arguments, _return = {};
        _return.name = (inArgs.length > 0) ? inArgs[0].text : property.name.text;
        _return.defaultValue = property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined;
        if (property.symbol) {
            _return.description = marked$2(LinkParser.resolveLinks(ts$1.displayPartsToString(property.symbol.getDocumentationComment())));
        }
        if (!_return.description) {
            if (property.jsDoc) {
                if (property.jsDoc.length > 0) {
                    if (typeof property.jsDoc[0].comment !== 'undefined') {
                        _return.description = marked$2(property.jsDoc[0].comment);
                    }
                }
            }
        }
        _return.line = this.getPosition(property, sourceFile).line + 1;
        if (property.type) {
            _return.type = this.visitType(property);
        }
        else {
            // handle NewExpression
            if (property.initializer) {
                if (property.initializer.kind === ts$1.SyntaxKind.NewExpression) {
                    if (property.initializer.expression) {
                        _return.type = property.initializer.expression.text;
                    }
                }
            }
        }
        return _return;
    };
    Dependencies.prototype.isPublic = function (member) {
        if (member.modifiers) {
            var isPublic = member.modifiers.some(function (modifier) {
                return modifier.kind === ts$1.SyntaxKind.PublicKeyword;
            });
            if (isPublic) {
                return true;
            }
        }
        return this.isHiddenMember(member);
    };
    Dependencies.prototype.isPrivate = function (member) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        if (member.modifiers) {
            var isPrivate = member.modifiers.some(function (modifier) { return modifier.kind === ts$1.SyntaxKind.PrivateKeyword; });
            if (isPrivate) {
                return true;
            }
        }
        return this.isHiddenMember(member);
    };
    Dependencies.prototype.isInternal = function (member) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var internalTags = ['internal'];
        if (member.jsDoc) {
            for (var _i = 0, _a = member.jsDoc; _i < _a.length; _i++) {
                var doc = _a[_i];
                if (doc.tags) {
                    for (var _b = 0, _c = doc.tags; _b < _c.length; _b++) {
                        var tag = _c[_b];
                        if (internalTags.indexOf(tag.tagName.text) > -1) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };
    Dependencies.prototype.isHiddenMember = function (member) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var internalTags = ['hidden'];
        if (member.jsDoc) {
            for (var _i = 0, _a = member.jsDoc; _i < _a.length; _i++) {
                var doc = _a[_i];
                if (doc.tags) {
                    for (var _b = 0, _c = doc.tags; _b < _c.length; _b++) {
                        var tag = _c[_b];
                        if (internalTags.indexOf(tag.tagName.text) > -1) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };
    Dependencies.prototype.isAngularLifecycleHook = function (methodName) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var ANGULAR_LIFECYCLE_METHODS = [
            'ngOnInit', 'ngOnChanges', 'ngDoCheck', 'ngOnDestroy', 'ngAfterContentInit', 'ngAfterContentChecked',
            'ngAfterViewInit', 'ngAfterViewChecked', 'writeValue', 'registerOnChange', 'registerOnTouched', 'setDisabledState'
        ];
        return ANGULAR_LIFECYCLE_METHODS.indexOf(methodName) >= 0;
    };
    Dependencies.prototype.visitConstructorDeclaration = function (method, sourceFile) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var result = {
            name: 'constructor',
            description: '',
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            line: this.getPosition(method, sourceFile).line + 1
        }, jsdoctags = JSDocTagsParser.getJSDocs(method);
        if (method.symbol) {
            result.description = marked$2(LinkParser.resolveLinks(ts$1.displayPartsToString(method.symbol.getDocumentationComment())));
        }
        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                result.modifierKind = method.modifiers[0].kind;
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitConstructorProperties = function (method) {
        var that = this;
        if (method.parameters) {
            var _parameters = [], i = 0, len = method.parameters.length;
            for (i; i < len; i++) {
                if (that.isPublic(method.parameters[i])) {
                    _parameters.push(that.visitArgument(method.parameters[i]));
                }
            }
            return _parameters;
        }
        else {
            return [];
        }
    };
    Dependencies.prototype.visitCallDeclaration = function (method, sourceFile) {
        var _this = this;
        var result = {
            description: marked$2(LinkParser.resolveLinks(ts$1.displayPartsToString(method.symbol.getDocumentationComment()))),
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        }, jsdoctags = JSDocTagsParser.getJSDocs(method);
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitIndexDeclaration = function (method, sourceFile) {
        var _this = this;
        return {
            description: marked$2(LinkParser.resolveLinks(ts$1.displayPartsToString(method.symbol.getDocumentationComment()))),
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        };
    };
    Dependencies.prototype.getPosition = function (node, sourceFile) {
        var position;
        if (node['name'] && node['name'].end) {
            position = ts$1.getLineAndCharacterOfPosition(sourceFile, node['name'].end);
        }
        else {
            position = ts$1.getLineAndCharacterOfPosition(sourceFile, node.pos);
        }
        return position;
    };
    Dependencies.prototype.visitMethodDeclaration = function (method, sourceFile) {
        var _this = this;
        var result = {
            name: method.name.text,
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        }, jsdoctags = JSDocTagsParser.getJSDocs(method);
        if (method.symbol) {
            result.description = marked$2(LinkParser.resolveLinks(ts$1.displayPartsToString(method.symbol.getDocumentationComment())));
        }
        if (method.decorators) {
            result.decorators = this.formatDecorators(method.decorators);
        }
        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                result.modifierKind = method.modifiers[0].kind;
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitArgument = function (arg) {
        var _result = {
            name: arg.name.text,
            type: this.visitType(arg)
        };
        if (arg.dotDotDotToken) {
            _result.dotDotDotToken = true;
        }
        return _result;
    };
    Dependencies.prototype.getNamesCompareFn = function (name) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        name = name || 'name';
        var t = function (a, b) {
            if (a[name]) {
                return a[name].localeCompare(b[name]);
            }
            else {
                return 0;
            }
        };
        return t;
    };
    Dependencies.prototype.stringifyDefaultValue = function (node) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        if (node.text) {
            return node.text;
        }
        else if (node.kind === ts$1.SyntaxKind.FalseKeyword) {
            return 'false';
        }
        else if (node.kind === ts$1.SyntaxKind.TrueKeyword) {
            return 'true';
        }
    };
    Dependencies.prototype.formatDecorators = function (decorators) {
        var _decorators = [];
        _$5.forEach(decorators, function (decorator) {
            if (decorator.expression) {
                if (decorator.expression.text) {
                    _decorators.push({
                        name: decorator.expression.text
                    });
                }
                if (decorator.expression.expression) {
                    var info = {
                        name: decorator.expression.expression.text
                    };
                    if (decorator.expression.expression.arguments) {
                        if (decorator.expression.expression.arguments.length > 0) {
                            info.args = decorator.expression.expression.arguments;
                        }
                    }
                    _decorators.push(info);
                }
            }
        });
        return _decorators;
    };
    Dependencies.prototype.visitProperty = function (property, sourceFile) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var result = {
            name: property.name.text,
            defaultValue: property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined,
            type: this.visitType(property),
            description: '',
            line: this.getPosition(property, sourceFile).line + 1
        }, jsdoctags = JSDocTagsParser.getJSDocs(property);
        if (property.symbol) {
            result.description = marked$2(LinkParser.resolveLinks(ts$1.displayPartsToString(property.symbol.getDocumentationComment())));
        }
        if (property.decorators) {
            result.decorators = this.formatDecorators(property.decorators);
        }
        if (property.modifiers) {
            if (property.modifiers.length > 0) {
                result.modifierKind = property.modifiers[0].kind;
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitMembers = function (members, sourceFile) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var inputs = [], outputs = [], methods = [], properties = [], indexSignatures = [], kind, inputDecorator, constructor, outDecorator;
        for (var i = 0; i < members.length; i++) {
            inputDecorator = this.getDecoratorOfType(members[i], 'Input');
            outDecorator = this.getDecoratorOfType(members[i], 'Output');
            kind = members[i].kind;
            if (inputDecorator) {
                inputs.push(this.visitInput(members[i], inputDecorator, sourceFile));
            }
            else if (outDecorator) {
                outputs.push(this.visitOutput(members[i], outDecorator, sourceFile));
            }
            else if (!this.isHiddenMember(members[i])) {
                if ((this.isPrivate(members[i]) || this.isInternal(members[i])) && this.configuration.mainData.disablePrivateOrInternalSupport) { }
                else {
                    if ((members[i].kind === ts$1.SyntaxKind.MethodDeclaration ||
                        members[i].kind === ts$1.SyntaxKind.MethodSignature)) {
                        methods.push(this.visitMethodDeclaration(members[i], sourceFile));
                    }
                    else if (members[i].kind === ts$1.SyntaxKind.PropertyDeclaration ||
                        members[i].kind === ts$1.SyntaxKind.PropertySignature || members[i].kind === ts$1.SyntaxKind.GetAccessor) {
                        properties.push(this.visitProperty(members[i], sourceFile));
                    }
                    else if (members[i].kind === ts$1.SyntaxKind.CallSignature) {
                        properties.push(this.visitCallDeclaration(members[i], sourceFile));
                    }
                    else if (members[i].kind === ts$1.SyntaxKind.IndexSignature) {
                        indexSignatures.push(this.visitIndexDeclaration(members[i], sourceFile));
                    }
                    else if (members[i].kind === ts$1.SyntaxKind.Constructor) {
                        var _constructorProperties = this.visitConstructorProperties(members[i]), j = 0, len = _constructorProperties.length;
                        for (j; j < len; j++) {
                            properties.push(_constructorProperties[j]);
                        }
                        constructor = this.visitConstructorDeclaration(members[i], sourceFile);
                    }
                }
            }
        }
        inputs.sort(this.getNamesCompareFn());
        outputs.sort(this.getNamesCompareFn());
        properties.sort(this.getNamesCompareFn());
        indexSignatures.sort(this.getNamesCompareFn());
        return {
            inputs: inputs,
            outputs: outputs,
            methods: methods,
            properties: properties,
            indexSignatures: indexSignatures,
            kind: kind,
            constructor: constructor
        };
    };
    Dependencies.prototype.visitDirectiveDecorator = function (decorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var selector;
        var exportAs;
        var properties;
        if (decorator.expression.arguments.length > 0) {
            properties = decorator.expression.arguments[0].properties;
            for (var i = 0; i < properties.length; i++) {
                if (properties[i].name.text === 'selector') {
                    // TODO: this will only work if selector is initialized as a string literal
                    selector = properties[i].initializer.text;
                }
                if (properties[i].name.text === 'exportAs') {
                    // TODO: this will only work if selector is initialized as a string literal
                    exportAs = properties[i].initializer.text;
                }
            }
        }
        return {
            selector: selector,
            exportAs: exportAs
        };
    };
    Dependencies.prototype.isPipeDecorator = function (decorator) {
        return (decorator.expression.expression) ? decorator.expression.expression.text === 'Pipe' : false;
    };
    Dependencies.prototype.isModuleDecorator = function (decorator) {
        return (decorator.expression.expression) ? decorator.expression.expression.text === 'NgModule' : false;
    };
    Dependencies.prototype.isDirectiveDecorator = function (decorator) {
        if (decorator.expression.expression) {
            var decoratorIdentifierText = decorator.expression.expression.text;
            return decoratorIdentifierText === 'Directive' || decoratorIdentifierText === 'Component';
        }
        else {
            return false;
        }
    };
    Dependencies.prototype.isServiceDecorator = function (decorator) {
        return (decorator.expression.expression) ? decorator.expression.expression.text === 'Injectable' : false;
    };
    Dependencies.prototype.visitClassDeclaration = function (fileName, classDeclaration, sourceFile) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var symbol = this.typeChecker.getSymbolAtLocation(classDeclaration.name);
        var description = '';
        if (symbol) {
            description = marked$2(LinkParser.resolveLinks(ts$1.displayPartsToString(symbol.getDocumentationComment())));
        }
        var className = classDeclaration.name.text;
        var directiveInfo;
        var members;
        var implementsElements = [];
        var extendsElement;
        var jsdoctags = [];
        if (typeof ts$1.getClassImplementsHeritageClauseElements !== 'undefined') {
            var implementedTypes = ts$1.getClassImplementsHeritageClauseElements(classDeclaration);
            if (implementedTypes) {
                var i_1 = 0, len = implementedTypes.length;
                for (i_1; i_1 < len; i_1++) {
                    if (implementedTypes[i_1].expression) {
                        implementsElements.push(implementedTypes[i_1].expression.text);
                    }
                }
            }
        }
        if (typeof ts$1.getClassExtendsHeritageClauseElement !== 'undefined') {
            var extendsTypes = ts$1.getClassExtendsHeritageClauseElement(classDeclaration);
            if (extendsTypes) {
                if (extendsTypes.expression) {
                    extendsElement = extendsTypes.expression.text;
                }
            }
        }
        if (symbol) {
            if (symbol.valueDeclaration) {
                jsdoctags = JSDocTagsParser.getJSDocs(symbol.valueDeclaration);
            }
        }
        if (classDeclaration.decorators) {
            for (var i = 0; i < classDeclaration.decorators.length; i++) {
                if (this.isDirectiveDecorator(classDeclaration.decorators[i])) {
                    directiveInfo = this.visitDirectiveDecorator(classDeclaration.decorators[i]);
                    members = this.visitMembers(classDeclaration.members, sourceFile);
                    return {
                        description: description,
                        inputs: members.inputs,
                        outputs: members.outputs,
                        properties: members.properties,
                        methods: members.methods,
                        indexSignatures: members.indexSignatures,
                        kind: members.kind,
                        constructor: members.constructor,
                        jsdoctags: jsdoctags,
                        extends: extendsElement,
                        implements: implementsElements
                    };
                }
                else if (this.isServiceDecorator(classDeclaration.decorators[i])) {
                    members = this.visitMembers(classDeclaration.members, sourceFile);
                    return [{
                            fileName: fileName,
                            className: className,
                            description: description,
                            methods: members.methods,
                            indexSignatures: members.indexSignatures,
                            properties: members.properties,
                            kind: members.kind,
                            constructor: members.constructor,
                            extends: extendsElement,
                            implements: implementsElements
                        }];
                }
                else if (this.isPipeDecorator(classDeclaration.decorators[i]) || this.isModuleDecorator(classDeclaration.decorators[i])) {
                    return [{
                            fileName: fileName,
                            className: className,
                            description: description,
                            jsdoctags: jsdoctags
                        }];
                }
                else {
                    //console.log('custom decorator');
                }
            }
        }
        else if (description) {
            members = this.visitMembers(classDeclaration.members, sourceFile);
            return [{
                    description: description,
                    methods: members.methods,
                    indexSignatures: members.indexSignatures,
                    properties: members.properties,
                    kind: members.kind,
                    constructor: members.constructor,
                    extends: extendsElement,
                    implements: implementsElements
                }];
        }
        else {
            members = this.visitMembers(classDeclaration.members, sourceFile);
            return [{
                    methods: members.methods,
                    indexSignatures: members.indexSignatures,
                    properties: members.properties,
                    kind: members.kind,
                    constructor: members.constructor,
                    extends: extendsElement,
                    implements: implementsElements
                }];
        }
        return [];
    };
    Dependencies.prototype.visitTypeDeclaration = function (type) {
        var result = {
            name: type.name.text
        }, jsdoctags = JSDocTagsParser.getJSDocs(type);
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitFunctionDeclaration = function (method) {
        var mapTypes = function (type) {
            switch (type) {
                case 94:
                    return 'Null';
                case 118:
                    return 'Any';
                case 121:
                    return 'Boolean';
                case 129:
                    return 'Never';
                case 132:
                    return 'Number';
                case 134:
                    return 'String';
                case 137:
                    return 'Undefined';
                case 157:
                    return 'TypeReference';
            }
        };
        var visitArgument = function (arg) {
            var result = {
                name: arg.name.text
            };
            if (arg.type) {
                result.type = mapTypes(arg.type.kind);
                if (arg.type.kind === 157) {
                    //try replace TypeReference with typeName
                    if (arg.type.typeName) {
                        result.type = arg.type.typeName.text;
                    }
                }
            }
            return result;
        };
        var result = {
            name: method.name.text,
            args: method.parameters ? method.parameters.map(function (prop) { return visitArgument(prop); }) : []
        }, jsdoctags = JSDocTagsParser.getJSDocs(method);
        if (typeof method.type !== 'undefined') {
            result.returnType = this.visitType(method.type);
        }
        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                result.modifierKind = method.modifiers[0].kind;
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitVariableDeclaration = function (node) {
        if (node.declarationList.declarations) {
            var i = 0, len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                var result = {
                    name: node.declarationList.declarations[i].name.text,
                    defaultValue: node.declarationList.declarations[i].initializer ? this.stringifyDefaultValue(node.declarationList.declarations[i].initializer) : undefined
                };
                if (node.declarationList.declarations[i].initializer) {
                    result.initializer = node.declarationList.declarations[i].initializer;
                }
                if (node.declarationList.declarations[i].type) {
                    result.type = this.visitType(node.declarationList.declarations[i].type);
                }
                return result;
            }
        }
    };
    Dependencies.prototype.visitFunctionDeclarationJSDocTags = function (node) {
        var jsdoctags = JSDocTagsParser.getJSDocs(node), result;
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitEnumAndFunctionDeclarationDescription = function (node) {
        var description = '';
        if (node.jsDoc) {
            if (node.jsDoc.length > 0) {
                if (typeof node.jsDoc[0].comment !== 'undefined') {
                    description = marked$2(node.jsDoc[0].comment);
                }
            }
        }
        return description;
    };
    Dependencies.prototype.visitEnumDeclaration = function (node) {
        var result = [];
        if (node.members) {
            var i = 0, len = node.members.length;
            for (i; i < len; i++) {
                var member = {
                    name: node.members[i].name.text
                };
                if (node.members[i].initializer) {
                    member.value = node.members[i].initializer.text;
                }
                result.push(member);
            }
        }
        return result;
    };
    Dependencies.prototype.visitEnumDeclarationForRoutes = function (fileName, node) {
        if (node.declarationList.declarations) {
            var i = 0, len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                if (node.declarationList.declarations[i].type) {
                    if (node.declarationList.declarations[i].type.typeName && node.declarationList.declarations[i].type.typeName.text === 'Routes') {
                        var data = generate(node.declarationList.declarations[i].initializer);
                        RouterParser.addRoute({
                            name: node.declarationList.declarations[i].name.text,
                            data: RouterParser.cleanRawRoute(data),
                            filename: fileName
                        });
                        return [{
                                routes: data
                            }];
                    }
                }
            }
        }
        return [];
    };
    Dependencies.prototype.getRouteIO = function (filename, sourceFile) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce(function (directive, statement) {
            if (statement.kind === ts$1.SyntaxKind.VariableStatement) {
                return directive.concat(_this.visitEnumDeclarationForRoutes(filename, statement));
            }
            return directive;
        }, []);
        return res[0] || {};
    };
    Dependencies.prototype.getComponentIO = function (filename, sourceFile, node) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce(function (directive, statement) {
            if (statement.kind === ts$1.SyntaxKind.ClassDeclaration) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(_this.visitClassDeclaration(filename, statement, sourceFile));
                }
            }
            return directive;
        }, []);
        return res[0] || {};
    };
    Dependencies.prototype.getClassIO = function (filename, sourceFile, node) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce(function (directive, statement) {
            if (statement.kind === ts$1.SyntaxKind.ClassDeclaration) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(_this.visitClassDeclaration(filename, statement, sourceFile));
                }
            }
            return directive;
        }, []);
        return res[0] || {};
    };
    Dependencies.prototype.getInterfaceIO = function (filename, sourceFile, node) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce(function (directive, statement) {
            if (statement.kind === ts$1.SyntaxKind.InterfaceDeclaration) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(_this.visitClassDeclaration(filename, statement, sourceFile));
                }
            }
            return directive;
        }, []);
        return res[0] || {};
    };
    Dependencies.prototype.getComponentOutputs = function (props) {
        return this.getSymbolDeps(props, 'outputs');
    };
    Dependencies.prototype.getComponentProviders = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'providers').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Dependencies.prototype.getComponentViewProviders = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'viewProviders').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Dependencies.prototype.getComponentDirectives = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'directives').map(function (name) {
            var identifier = _this.parseDeepIndentifier(name);
            identifier.selector = _this.findComponentSelectorByName(name);
            identifier.label = '';
            return identifier;
        });
    };
    Dependencies.prototype.parseDeepIndentifier = function (name) {
        var nsModule = name.split('.'), type = this.getType(name);
        if (nsModule.length > 1) {
            // cache deps with the same namespace (i.e Shared.*)
            if (this.__nsModule[nsModule[0]]) {
                this.__nsModule[nsModule[0]].push(name);
            }
            else {
                this.__nsModule[nsModule[0]] = [name];
            }
            return {
                ns: nsModule[0],
                name: name,
                type: type
            };
        }
        return {
            name: name,
            type: type
        };
    };
    Dependencies.prototype.getComponentTemplateUrl = function (props) {
        return this.getSymbolDeps(props, 'templateUrl');
    };
    Dependencies.prototype.getComponentTemplate = function (props) {
        var t = this.getSymbolDeps(props, 'template', true).pop();
        if (t) {
            t = detectIndent(t, 0);
            t = t.replace(/\n/, '');
            t = t.replace(/ +$/gm, '');
        }
        return t;
    };
    Dependencies.prototype.getComponentStyleUrls = function (props) {
        return this.sanitizeUrls(this.getSymbolDeps(props, 'styleUrls'));
    };
    Dependencies.prototype.getComponentStyles = function (props) {
        return this.getSymbolDeps(props, 'styles');
    };
    Dependencies.prototype.getComponentModuleId = function (props) {
        return this.getSymbolDeps(props, 'moduleId').pop();
    };
    Dependencies.prototype.getComponentChangeDetection = function (props) {
        return this.getSymbolDeps(props, 'changeDetection').pop();
    };
    Dependencies.prototype.getComponentEncapsulation = function (props) {
        return this.getSymbolDeps(props, 'encapsulation');
    };
    Dependencies.prototype.sanitizeUrls = function (urls) {
        return urls.map(function (url) { return url.replace('./', ''); });
    };
    Dependencies.prototype.getSymbolDepsObject = function (props, type, multiLine) {
        var deps = props.filter(function (node) {
            return node.name.text === type;
        });
        var parseProperties = function (node) {
            var obj = {};
            (node.initializer.properties || []).forEach(function (prop) {
                obj[prop.name.text] = prop.initializer.text;
            });
            return obj;
        };
        return deps.map(parseProperties).pop();
    };
    Dependencies.prototype.getSymbolDepsRaw = function (props, type, multiLine) {
        var deps = props.filter(function (node) {
            return node.name.text === type;
        });
        return deps || [];
    };
    Dependencies.prototype.getSymbolDeps = function (props, type, multiLine) {
        var _this = this;
        var deps = props.filter(function (node) {
            return node.name.text === type;
        });
        var parseSymbolText = function (text) {
            return [
                text
            ];
        };
        var buildIdentifierName = function (node, name) {
            if (name === void 0) { name = ''; }
            if (node.expression) {
                name = name ? "." + name : name;
                var nodeName = _this.unknown;
                if (node.name) {
                    nodeName = node.name.text;
                }
                else if (node.text) {
                    nodeName = node.text;
                }
                else if (node.expression) {
                    if (node.expression.text) {
                        nodeName = node.expression.text;
                    }
                    else if (node.expression.elements) {
                        if (node.expression.kind === ts$1.SyntaxKind.ArrayLiteralExpression) {
                            nodeName = node.expression.elements.map(function (el) { return el.text; }).join(', ');
                            nodeName = "[" + nodeName + "]";
                        }
                    }
                }
                if (node.kind === ts$1.SyntaxKind.SpreadElement) {
                    return "..." + nodeName;
                }
                return "" + buildIdentifierName(node.expression, nodeName) + name;
            }
            return node.text + "." + name;
        };
        var parseProviderConfiguration = function (o) {
            // parse expressions such as:
            // { provide: APP_BASE_HREF, useValue: '/' },
            // or
            // { provide: 'Date', useFactory: (d1, d2) => new Date(), deps: ['d1', 'd2'] }
            var _genProviderName = [];
            var _providerProps = [];
            (o.properties || []).forEach(function (prop) {
                var identifier = prop.initializer.text;
                if (prop.initializer.kind === ts$1.SyntaxKind.StringLiteral) {
                    identifier = "'" + identifier + "'";
                }
                // lambda function (i.e useFactory)
                if (prop.initializer.body) {
                    var params = (prop.initializer.parameters || []).map(function (params) { return params.name.text; });
                    identifier = "(" + params.join(', ') + ") => {}";
                }
                else if (prop.initializer.elements) {
                    var elements = (prop.initializer.elements || []).map(function (n) {
                        if (n.kind === ts$1.SyntaxKind.StringLiteral) {
                            return "'" + n.text + "'";
                        }
                        return n.text;
                    });
                    identifier = "[" + elements.join(', ') + "]";
                }
                _providerProps.push([
                    // i.e provide
                    prop.name.text,
                    // i.e OpaqueToken or 'StringToken'
                    identifier
                ].join(': '));
            });
            return "{ " + _providerProps.join(', ') + " }";
        };
        var parseSymbolElements = function (o) {
            // parse expressions such as: AngularFireModule.initializeApp(firebaseConfig)
            if (o.arguments) {
                var className = buildIdentifierName(o.expression);
                // function arguments could be really complexe. There are so
                // many use cases that we can't handle. Just print "args" to indicate
                // that we have arguments.
                var functionArgs = o.arguments.length > 0 ? 'args' : '';
                var text = className + "(" + functionArgs + ")";
                return text;
            }
            else if (o.expression) {
                var identifier = buildIdentifierName(o);
                return identifier;
            }
            return o.text ? o.text : parseProviderConfiguration(o);
        };
        var parseSymbols = function (node) {
            var text = node.initializer.text;
            if (text) {
                return parseSymbolText(text);
            }
            else if (node.initializer.expression) {
                var identifier = parseSymbolElements(node.initializer);
                return [
                    identifier
                ];
            }
            else if (node.initializer.elements) {
                return node.initializer.elements.map(parseSymbolElements);
            }
        };
        return deps.map(parseSymbols).pop() || [];
    };
    Dependencies.prototype.findComponentSelectorByName = function (name) {
        return this.__cache[name];
    };
    return Dependencies;
}());

function promiseSequential(promises) {
    if (!Array.isArray(promises)) {
        throw new Error('First argument need to be an array of Promises');
    }
    return new Promise(function (resolve$$1, reject) {
        var count = 0;
        var results = [];
        var iterateeFunc = function (previousPromise, currentPromise) {
            return previousPromise
                .then(function (result) {
                if (count++ !== 0)
                    results = results.concat(result);
                return currentPromise(result, results, count);
            })
                .catch(function (err) {
                return reject(err);
            });
        };
        promises = promises.concat(function () { return Promise.resolve(); });
        promises
            .reduce(iterateeFunc, Promise.resolve(false))
            .then(function (res) {
            resolve$$1(results);
        });
    });
}

var glob = require('glob');
var ts = require('typescript');
var _ = require('lodash');
var marked = require('marked');
var chokidar = require('chokidar');
var pkg = require('../package.json');
var cwd = process.cwd();
var $htmlengine = new HtmlEngine();
var $fileengine = new FileEngine();
var $markdownengine = new MarkdownEngine();
var $ngdengine = new NgdEngine();
var $searchEngine = new SearchEngine();
var startTime = new Date();
var Application = (function () {
    /**
     * Create a new compodoc application instance.
     *
     * @param options An object containing the options that should be used.
     */
    function Application(options) {
        var _this = this;
        /**
         * Files changed during watch scanning
         */
        this.watchChangedFiles = [];
        /**
         * Boolean for watching status
         * @type {boolean}
         */
        this.isWatching = false;
        this.preparePipes = function (somePipes) {
            logger.info('Prepare pipes');
            _this.configuration.mainData.pipes = (somePipes) ? somePipes : $dependenciesEngine.getPipes();
            return new Promise(function (resolve$$1, reject) {
                var i = 0, len = _this.configuration.mainData.pipes.length;
                for (i; i < len; i++) {
                    _this.configuration.addPage({
                        path: 'pipes',
                        name: _this.configuration.mainData.pipes[i].name,
                        context: 'pipe',
                        pipe: _this.configuration.mainData.pipes[i],
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    });
                }
                resolve$$1();
            });
        };
        this.prepareClasses = function (someClasses) {
            logger.info('Prepare classes');
            _this.configuration.mainData.classes = (someClasses) ? someClasses : $dependenciesEngine.getClasses();
            return new Promise(function (resolve$$1, reject) {
                var i = 0, len = _this.configuration.mainData.classes.length;
                for (i; i < len; i++) {
                    _this.configuration.addPage({
                        path: 'classes',
                        name: _this.configuration.mainData.classes[i].name,
                        context: 'class',
                        class: _this.configuration.mainData.classes[i],
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    });
                }
                resolve$$1();
            });
        };
        this.prepareDirectives = function (someDirectives) {
            logger.info('Prepare directives');
            _this.configuration.mainData.directives = (someDirectives) ? someDirectives : $dependenciesEngine.getDirectives();
            return new Promise(function (resolve$$1, reject) {
                var i = 0, len = _this.configuration.mainData.directives.length;
                for (i; i < len; i++) {
                    _this.configuration.addPage({
                        path: 'directives',
                        name: _this.configuration.mainData.directives[i].name,
                        context: 'directive',
                        directive: _this.configuration.mainData.directives[i],
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    });
                }
                resolve$$1();
            });
        };
        this.configuration = Configuration.getInstance();
        for (var option in options) {
            if (typeof this.configuration.mainData[option] !== 'undefined') {
                this.configuration.mainData[option] = options[option];
            }
            // For documentationMainName, process it outside the loop, for handling conflict with pages name
            if (option === 'name') {
                this.configuration.mainData['documentationMainName'] = options[option];
            }
            // For documentationMainName, process it outside the loop, for handling conflict with pages name
            if (option === 'silent') {
                logger.silent = false;
            }
        }
    }
    /**
     * Start compodoc process
     */
    Application.prototype.generate = function () {
        var _this = this;
        if (this.configuration.mainData.output.charAt(this.configuration.mainData.output.length - 1) !== '/') {
            this.configuration.mainData.output += '/';
        }
        $htmlengine.init().then(function () {
            _this.processPackageJson();
        });
    };
    /**
     * Start compodoc documentation coverage
     */
    Application.prototype.testCoverage = function () {
        this.getDependenciesData();
    };
    /**
     * Store files for initial processing
     * @param  {Array<string>} files Files found during source folder and tsconfig scan
     */
    Application.prototype.setFiles = function (files) {
        this.files = files;
    };
    /**
     * Store files for watch processing
     * @param  {Array<string>} files Files found during source folder and tsconfig scan
     */
    Application.prototype.setUpdatedFiles = function (files) {
        this.updatedFiles = files;
    };
    /**
     * Return a boolean indicating presence of one TypeScript file in updatedFiles list
     * @return {boolean} Result of scan
     */
    Application.prototype.hasWatchedFilesTSFiles = function () {
        var result = false;
        _.forEach(this.updatedFiles, function (file) {
            if (path.extname(file) === '.ts') {
                result = true;
            }
        });
        return result;
    };
    /**
     * Return a boolean indicating presence of one root markdown files in updatedFiles list
     * @return {boolean} Result of scan
     */
    Application.prototype.hasWatchedFilesRootMarkdownFiles = function () {
        var result = false;
        _.forEach(this.updatedFiles, function (file) {
            if (path.extname(file) === '.md' && path.dirname(file) === process.cwd()) {
                result = true;
            }
        });
        return result;
    };
    /**
     * Clear files for watch processing
     */
    Application.prototype.clearUpdatedFiles = function () {
        this.updatedFiles = [];
        this.watchChangedFiles = [];
    };
    Application.prototype.processPackageJson = function () {
        var _this = this;
        logger.info('Searching package.json file');
        $fileengine.get('package.json').then(function (packageData) {
            var parsedData = JSON.parse(packageData);
            if (typeof parsedData.name !== 'undefined' && _this.configuration.mainData.documentationMainName === COMPODOC_DEFAULTS.title) {
                _this.configuration.mainData.documentationMainName = parsedData.name + ' documentation';
            }
            if (typeof parsedData.description !== 'undefined') {
                _this.configuration.mainData.documentationMainDescription = parsedData.description;
            }
            _this.configuration.mainData.angularVersion = getAngularVersionOfProject(parsedData);
            logger.info('package.json file found');
            _this.processMarkdowns().then(function () {
                _this.getDependenciesData();
            }, function (errorMessage) {
                logger.error(errorMessage);
            });
        }, function (errorMessage) {
            logger.error(errorMessage);
            logger.error('Continuing without package.json file');
            _this.processMarkdowns().then(function () {
                _this.getDependenciesData();
            }, function (errorMessage) {
                logger.error(errorMessage);
            });
        });
    };
    Application.prototype.processMarkdowns = function () {
        var _this = this;
        logger.info('Searching README.md, CHANGELOG.md, CONTRIBUTING.md, LICENSE.md, TODO.md files');
        return new Promise(function (resolve$$1, reject) {
            var i = 0, markdowns = ['readme', 'changelog', 'contributing', 'license', 'todo'], numberOfMarkdowns = 5, loop = function () {
                if (i < numberOfMarkdowns) {
                    $markdownengine.getTraditionalMarkdown(markdowns[i].toUpperCase()).then(function (readmeData) {
                        _this.configuration.addPage({
                            name: (markdowns[i] === 'readme') ? 'index' : markdowns[i],
                            context: 'getting-started',
                            markdown: readmeData,
                            depth: 0,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                        });
                        if (markdowns[i] === 'readme') {
                            _this.configuration.mainData.readme = true;
                            _this.configuration.addPage({
                                name: 'overview',
                                context: 'overview',
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                            });
                        }
                        else {
                            _this.configuration.mainData.markdowns.push({
                                name: markdowns[i],
                                uppername: markdowns[i].toUpperCase(),
                                depth: 0,
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                            });
                        }
                        logger.info(markdowns[i].toUpperCase() + ".md file found");
                        i++;
                        loop();
                    }, function (errorMessage) {
                        logger.warn(errorMessage);
                        logger.warn("Continuing without " + markdowns[i].toUpperCase() + ".md file");
                        if (markdowns[i] === 'readme') {
                            _this.configuration.addPage({
                                name: 'index',
                                context: 'overview'
                            });
                        }
                        i++;
                        loop();
                    });
                }
                else {
                    resolve$$1();
                }
            };
            loop();
        });
    };
    Application.prototype.rebuildRootMarkdowns = function () {
        var _this = this;
        logger.info('Regenerating README.md, CHANGELOG.md, CONTRIBUTING.md, LICENSE.md, TODO.md pages');
        var actions = [];
        this.configuration.resetRootMarkdownPages();
        actions.push(function () { return _this.processMarkdowns(); });
        promiseSequential(actions)
            .then(function (res) {
            _this.processPages();
            _this.clearUpdatedFiles();
        })
            .catch(function (errorMessage) {
            logger.error(errorMessage);
        });
    };
    /**
     * Get dependency data for small group of updated files during watch process
     */
    Application.prototype.getMicroDependenciesData = function () {
        logger.info('Get diff dependencies data');
        var crawler = new Dependencies(this.updatedFiles, {
            tsconfigDirectory: path.dirname(this.configuration.mainData.tsconfig)
        });
        var dependenciesData = crawler.getDependencies();
        $dependenciesEngine.update(dependenciesData);
        this.prepareJustAFewThings(dependenciesData);
    };
    /**
     * Rebuild external documentation during watch process
     */
    Application.prototype.rebuildExternalDocumentation = function () {
        var _this = this;
        logger.info('Rebuild external documentation');
        var actions = [];
        this.configuration.resetAdditionalPages();
        if (this.configuration.mainData.includes !== '') {
            actions.push(function () { return _this.prepareExternalIncludes(); });
        }
        promiseSequential(actions)
            .then(function (res) {
            _this.processPages();
            _this.clearUpdatedFiles();
        })
            .catch(function (errorMessage) {
            logger.error(errorMessage);
        });
    };
    Application.prototype.getDependenciesData = function () {
        logger.info('Get dependencies data');
        var crawler = new Dependencies(this.files, {
            tsconfigDirectory: path.dirname(this.configuration.mainData.tsconfig)
        });
        var dependenciesData = crawler.getDependencies();
        $dependenciesEngine.init(dependenciesData);
        this.configuration.mainData.routesLength = RouterParser.routesLength();
        this.prepareEverything();
    };
    Application.prototype.prepareJustAFewThings = function (diffCrawledData) {
        var _this = this;
        var actions = [];
        this.configuration.resetPages();
        actions.push(function () { return _this.prepareRoutes(); });
        if (diffCrawledData.modules.length > 0) {
            actions.push(function () { return _this.prepareModules(); });
        }
        if (diffCrawledData.components.length > 0) {
            actions.push(function () { return _this.prepareComponents(); });
        }
        if (diffCrawledData.directives.length > 0) {
            actions.push(function () { return _this.prepareDirectives(); });
        }
        if (diffCrawledData.injectables.length > 0) {
            actions.push(function () { return _this.prepareInjectables(); });
        }
        if (diffCrawledData.pipes.length > 0) {
            actions.push(function () { return _this.preparePipes(); });
        }
        if (diffCrawledData.classes.length > 0) {
            actions.push(function () { return _this.prepareClasses(); });
        }
        if (diffCrawledData.interfaces.length > 0) {
            actions.push(function () { return _this.prepareInterfaces(); });
        }
        if (diffCrawledData.miscellaneous.variables.length > 0 ||
            diffCrawledData.miscellaneous.functions.length > 0 ||
            diffCrawledData.miscellaneous.typealiases.length > 0 ||
            diffCrawledData.miscellaneous.enumerations.length > 0 ||
            diffCrawledData.miscellaneous.types.length > 0) {
            actions.push(function () { return _this.prepareMiscellaneous(); });
        }
        if (!this.configuration.mainData.disableCoverage) {
            actions.push(function () { return _this.prepareCoverage(); });
        }
        promiseSequential(actions)
            .then(function (res) {
            _this.processGraphs();
            _this.clearUpdatedFiles();
        })
            .catch(function (errorMessage) {
            logger.error(errorMessage);
        });
    };
    Application.prototype.prepareEverything = function () {
        var _this = this;
        var actions = [];
        actions.push(function () { return _this.prepareModules(); });
        actions.push(function () { return _this.prepareComponents(); });
        if ($dependenciesEngine.directives.length > 0) {
            actions.push(function () { return _this.prepareDirectives(); });
        }
        if ($dependenciesEngine.injectables.length > 0) {
            actions.push(function () { return _this.prepareInjectables(); });
        }
        if ($dependenciesEngine.routes && $dependenciesEngine.routes.children.length > 0) {
            actions.push(function () { return _this.prepareRoutes(); });
        }
        if ($dependenciesEngine.pipes.length > 0) {
            actions.push(function () { return _this.preparePipes(); });
        }
        if ($dependenciesEngine.classes.length > 0) {
            actions.push(function () { return _this.prepareClasses(); });
        }
        if ($dependenciesEngine.interfaces.length > 0) {
            actions.push(function () { return _this.prepareInterfaces(); });
        }
        if ($dependenciesEngine.miscellaneous.variables.length > 0 ||
            $dependenciesEngine.miscellaneous.functions.length > 0 ||
            $dependenciesEngine.miscellaneous.typealiases.length > 0 ||
            $dependenciesEngine.miscellaneous.enumerations.length > 0 ||
            $dependenciesEngine.miscellaneous.types.length > 0) {
            actions.push(function () { return _this.prepareMiscellaneous(); });
        }
        if (!this.configuration.mainData.disableCoverage) {
            actions.push(function () { return _this.prepareCoverage(); });
        }
        if (this.configuration.mainData.includes !== '') {
            actions.push(function () { return _this.prepareExternalIncludes(); });
        }
        promiseSequential(actions)
            .then(function (res) {
            _this.processGraphs();
        })
            .catch(function (errorMessage) {
            logger.error(errorMessage);
        });
    };
    Application.prototype.prepareExternalIncludes = function () {
        var _this = this;
        logger.info('Adding external markdown files');
        //Scan include folder for files detailed in summary.json
        //For each file, add to this.configuration.mainData.additionalPages
        //Each file will be converted to html page, inside COMPODOC_DEFAULTS.additionalEntryPath
        return new Promise(function (resolve$$1, reject) {
            $fileengine.get(_this.configuration.mainData.includes + path.sep + 'summary.json').then(function (summaryData) {
                logger.info('Additional documentation: summary.json file found');
                var parsedSummaryData = JSON.parse(summaryData), i = 0, len = parsedSummaryData.length, loop = function () {
                    if (i <= len - 1) {
                        $markdownengine.get(_this.configuration.mainData.includes + path.sep + parsedSummaryData[i].file).then(function (markedData) {
                            _this.configuration.addAdditionalPage({
                                name: parsedSummaryData[i].title,
                                filename: cleanNameWithoutSpaceAndToLowerCase(parsedSummaryData[i].title),
                                context: 'additional-page',
                                path: _this.configuration.mainData.includesFolder,
                                additionalPage: markedData,
                                depth: 1,
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                            });
                            if (parsedSummaryData[i].children && parsedSummaryData[i].children.length > 0) {
                                var j_1 = 0, leng_1 = parsedSummaryData[i].children.length, loopChild_1 = function () {
                                    if (j_1 <= leng_1 - 1) {
                                        $markdownengine.get(_this.configuration.mainData.includes + path.sep + parsedSummaryData[i].children[j_1].file).then(function (markedData) {
                                            _this.configuration.addAdditionalPage({
                                                name: parsedSummaryData[i].children[j_1].title,
                                                filename: cleanNameWithoutSpaceAndToLowerCase(parsedSummaryData[i].children[j_1].title),
                                                context: 'additional-page',
                                                path: _this.configuration.mainData.includesFolder + '/' + cleanNameWithoutSpaceAndToLowerCase(parsedSummaryData[i].title),
                                                additionalPage: markedData,
                                                depth: 2,
                                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                                            });
                                            j_1++;
                                            loopChild_1();
                                        }, function (e) {
                                            logger.error(e);
                                        });
                                    }
                                    else {
                                        i++;
                                        loop();
                                    }
                                };
                                loopChild_1();
                            }
                            else {
                                i++;
                                loop();
                            }
                        }, function (e) {
                            logger.error(e);
                        });
                    }
                    else {
                        resolve$$1();
                    }
                };
                loop();
            }, function (errorMessage) {
                logger.error(errorMessage);
                reject('Error during Additional documentation generation');
            });
        });
    };
    Application.prototype.prepareModules = function (someModules) {
        var _this = this;
        logger.info('Prepare modules');
        var i = 0, _modules = (someModules) ? someModules : $dependenciesEngine.getModules();
        return new Promise(function (resolve$$1, reject) {
            _this.configuration.mainData.modules = _modules.map(function (ngModule) {
                ['declarations', 'bootstrap', 'imports', 'exports'].forEach(function (metadataType) {
                    ngModule[metadataType] = ngModule[metadataType].filter(function (metaDataItem) {
                        switch (metaDataItem.type) {
                            case 'directive':
                                return $dependenciesEngine.getDirectives().some(function (directive) { return directive.name === metaDataItem.name; });
                            case 'component':
                                return $dependenciesEngine.getComponents().some(function (component) { return component.name === metaDataItem.name; });
                            case 'module':
                                return $dependenciesEngine.getModules().some(function (module) { return module.name === metaDataItem.name; });
                            case 'pipe':
                                return $dependenciesEngine.getPipes().some(function (pipe) { return pipe.name === metaDataItem.name; });
                            default:
                                return true;
                        }
                    });
                });
                ngModule.providers = ngModule.providers.filter(function (provider) {
                    return $dependenciesEngine.getInjectables().some(function (injectable) { return injectable.name === provider.name; });
                });
                return ngModule;
            });
            _this.configuration.addPage({
                name: 'modules',
                context: 'modules',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            var len = _this.configuration.mainData.modules.length;
            for (i; i < len; i++) {
                _this.configuration.addPage({
                    path: 'modules',
                    name: _this.configuration.mainData.modules[i].name,
                    context: 'module',
                    module: _this.configuration.mainData.modules[i],
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            resolve$$1();
        });
    };
    Application.prototype.prepareInterfaces = function (someInterfaces) {
        var _this = this;
        logger.info('Prepare interfaces');
        this.configuration.mainData.interfaces = (someInterfaces) ? someInterfaces : $dependenciesEngine.getInterfaces();
        return new Promise(function (resolve$$1, reject) {
            var i = 0, len = _this.configuration.mainData.interfaces.length;
            for (i; i < len; i++) {
                _this.configuration.addPage({
                    path: 'interfaces',
                    name: _this.configuration.mainData.interfaces[i].name,
                    context: 'interface',
                    interface: _this.configuration.mainData.interfaces[i],
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            resolve$$1();
        });
    };
    Application.prototype.prepareMiscellaneous = function (someMisc) {
        var _this = this;
        logger.info('Prepare miscellaneous');
        this.configuration.mainData.miscellaneous = (someMisc) ? someMisc : $dependenciesEngine.getMiscellaneous();
        return new Promise(function (resolve$$1, reject) {
            _this.configuration.addPage({
                name: 'miscellaneous',
                context: 'miscellaneous',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            resolve$$1();
        });
    };
    Application.prototype.prepareComponents = function (someComponents) {
        var _this = this;
        logger.info('Prepare components');
        this.configuration.mainData.components = (someComponents) ? someComponents : $dependenciesEngine.getComponents();
        return new Promise(function (mainResolve, reject) {
            var i = 0, len = _this.configuration.mainData.components.length, loop = function () {
                if (i <= len - 1) {
                    var dirname_1 = path.dirname(_this.configuration.mainData.components[i].file), handleTemplateurl_1 = function () {
                        return new Promise(function (resolve$$1, reject) {
                            var templatePath = path.resolve(dirname_1 + path.sep + _this.configuration.mainData.components[i].templateUrl);
                            if (fs.existsSync(templatePath)) {
                                fs.readFile(templatePath, 'utf8', function (err, data) {
                                    if (err) {
                                        logger.error(err);
                                        reject();
                                    }
                                    else {
                                        _this.configuration.mainData.components[i].templateData = data;
                                        resolve$$1();
                                    }
                                });
                            }
                            else {
                                logger.error("Cannot read template for " + _this.configuration.mainData.components[i].name);
                            }
                        });
                    };
                    if ($markdownengine.componentHasReadmeFile(_this.configuration.mainData.components[i].file)) {
                        logger.info(_this.configuration.mainData.components[i].name + " has a README file, include it");
                        var readmeFile = $markdownengine.componentReadmeFile(_this.configuration.mainData.components[i].file);
                        fs.readFile(readmeFile, 'utf8', function (err, data) {
                            if (err)
                                throw err;
                            _this.configuration.mainData.components[i].readme = marked(data);
                            _this.configuration.addPage({
                                path: 'components',
                                name: _this.configuration.mainData.components[i].name,
                                context: 'component',
                                component: _this.configuration.mainData.components[i],
                                depth: 1,
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                            });
                            if (_this.configuration.mainData.components[i].templateUrl.length > 0) {
                                logger.info(_this.configuration.mainData.components[i].name + " has a templateUrl, include it");
                                handleTemplateurl_1().then(function () {
                                    i++;
                                    loop();
                                }, function (e) {
                                    logger.error(e);
                                });
                            }
                            else {
                                i++;
                                loop();
                            }
                        });
                    }
                    else {
                        _this.configuration.addPage({
                            path: 'components',
                            name: _this.configuration.mainData.components[i].name,
                            context: 'component',
                            component: _this.configuration.mainData.components[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        if (_this.configuration.mainData.components[i].templateUrl.length > 0) {
                            logger.info(_this.configuration.mainData.components[i].name + " has a templateUrl, include it");
                            handleTemplateurl_1().then(function () {
                                i++;
                                loop();
                            }, function (e) {
                                logger.error(e);
                            });
                        }
                        else {
                            i++;
                            loop();
                        }
                    }
                }
                else {
                    mainResolve();
                }
            };
            loop();
        });
    };
    Application.prototype.prepareInjectables = function (someInjectables) {
        var _this = this;
        logger.info('Prepare injectables');
        this.configuration.mainData.injectables = (someInjectables) ? someInjectables : $dependenciesEngine.getInjectables();
        return new Promise(function (resolve$$1, reject) {
            var i = 0, len = _this.configuration.mainData.injectables.length;
            for (i; i < len; i++) {
                _this.configuration.addPage({
                    path: 'injectables',
                    name: _this.configuration.mainData.injectables[i].name,
                    context: 'injectable',
                    injectable: _this.configuration.mainData.injectables[i],
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            resolve$$1();
        });
    };
    Application.prototype.prepareRoutes = function () {
        var _this = this;
        logger.info('Process routes');
        this.configuration.mainData.routes = $dependenciesEngine.getRoutes();
        return new Promise(function (resolve$$1, reject) {
            _this.configuration.addPage({
                name: 'routes',
                context: 'routes',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            RouterParser.generateRoutesIndex(_this.configuration.mainData.output, _this.configuration.mainData.routes).then(function () {
                logger.info('Routes index generated');
                resolve$$1();
            }, function (e) {
                logger.error(e);
                reject();
            });
        });
    };
    Application.prototype.prepareCoverage = function () {
        var _this = this;
        logger.info('Process documentation coverage report');
        return new Promise(function (resolve$$1, reject) {
            /*
             * loop with components, classes, injectables, interfaces, pipes
             */
            var files = [], totalProjectStatementDocumented = 0, getStatus = function (percent) {
                var status;
                if (percent <= 25) {
                    status = 'low';
                }
                else if (percent > 25 && percent <= 50) {
                    status = 'medium';
                }
                else if (percent > 50 && percent <= 75) {
                    status = 'good';
                }
                else {
                    status = 'good';
                }
                return status;
            };
            _.forEach(_this.configuration.mainData.components, function (component) {
                if (!component.propertiesClass ||
                    !component.methodsClass ||
                    !component.inputsClass ||
                    !component.outputsClass) {
                    return;
                }
                var cl = {
                    filePath: component.file,
                    type: component.type,
                    linktype: component.type,
                    name: component.name
                }, totalStatementDocumented = 0, totalStatements = component.propertiesClass.length + component.methodsClass.length + component.inputsClass.length + component.outputsClass.length + 1; // +1 for component decorator comment
                if (component.constructorObj) {
                    totalStatements += 1;
                    if (component.constructorObj && component.constructorObj.description && component.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (component.description && component.description !== '') {
                    totalStatementDocumented += 1;
                }
                _.forEach(component.propertiesClass, function (property) {
                    if (property.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (property.description && property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(component.methodsClass, function (method) {
                    if (method.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (method.description && method.description !== '' && method.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(component.inputsClass, function (input) {
                    if (input.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (input.description && input.description !== '' && input.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(component.outputsClass, function (output) {
                    if (output.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (output.description && output.description !== '' && output.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                if (totalStatements === 0) {
                    cl.coveragePercent = 0;
                }
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });
            _.forEach(_this.configuration.mainData.classes, function (classe) {
                if (!classe.properties ||
                    !classe.methods) {
                    return;
                }
                var cl = {
                    filePath: classe.file,
                    type: 'class',
                    linktype: 'classe',
                    name: classe.name
                }, totalStatementDocumented = 0, totalStatements = classe.properties.length + classe.methods.length + 1; // +1 for class itself
                if (classe.constructorObj) {
                    totalStatements += 1;
                    if (classe.constructorObj && classe.constructorObj.description && classe.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (classe.description && classe.description !== '') {
                    totalStatementDocumented += 1;
                }
                _.forEach(classe.properties, function (property) {
                    if (property.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (property.description && property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(classe.methods, function (method) {
                    if (method.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (method.description && method.description !== '' && method.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                if (totalStatements === 0) {
                    cl.coveragePercent = 0;
                }
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });
            _.forEach(_this.configuration.mainData.injectables, function (injectable) {
                if (!injectable.properties ||
                    !injectable.methods) {
                    return;
                }
                var cl = {
                    filePath: injectable.file,
                    type: injectable.type,
                    linktype: injectable.type,
                    name: injectable.name
                }, totalStatementDocumented = 0, totalStatements = injectable.properties.length + injectable.methods.length + 1; // +1 for injectable itself
                if (injectable.constructorObj) {
                    totalStatements += 1;
                    if (injectable.constructorObj && injectable.constructorObj.description && injectable.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (injectable.description && injectable.description !== '') {
                    totalStatementDocumented += 1;
                }
                _.forEach(injectable.properties, function (property) {
                    if (property.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (property.description && property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(injectable.methods, function (method) {
                    if (method.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (method.description && method.description !== '' && method.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                if (totalStatements === 0) {
                    cl.coveragePercent = 0;
                }
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });
            _.forEach(_this.configuration.mainData.interfaces, function (inter) {
                if (!inter.properties ||
                    !inter.methods) {
                    return;
                }
                var cl = {
                    filePath: inter.file,
                    type: inter.type,
                    linktype: inter.type,
                    name: inter.name
                }, totalStatementDocumented = 0, totalStatements = inter.properties.length + inter.methods.length + 1; // +1 for interface itself
                if (inter.constructorObj) {
                    totalStatements += 1;
                    if (inter.constructorObj && inter.constructorObj.description && inter.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (inter.description && inter.description !== '') {
                    totalStatementDocumented += 1;
                }
                _.forEach(inter.properties, function (property) {
                    if (property.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (property.description && property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(inter.methods, function (method) {
                    if (method.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (method.description && method.description !== '' && method.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                if (totalStatements === 0) {
                    cl.coveragePercent = 0;
                }
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });
            _.forEach(_this.configuration.mainData.pipes, function (pipe) {
                var cl = {
                    filePath: pipe.file,
                    type: pipe.type,
                    linktype: pipe.type,
                    name: pipe.name
                }, totalStatementDocumented = 0, totalStatements = 1;
                if (pipe.description && pipe.description !== '') {
                    totalStatementDocumented += 1;
                }
                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });
            files = _.sortBy(files, ['filePath']);
            var coverageData = {
                count: (files.length > 0) ? Math.floor(totalProjectStatementDocumented / files.length) : 0,
                status: ''
            };
            coverageData.status = getStatus(coverageData.count);
            _this.configuration.addPage({
                name: 'coverage',
                context: 'coverage',
                files: files,
                data: coverageData,
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            $htmlengine.generateCoverageBadge(_this.configuration.mainData.output, coverageData);
            if (_this.configuration.mainData.coverageTest) {
                if (coverageData.count >= _this.configuration.mainData.coverageTestThreshold) {
                    logger.info('Documentation coverage is over threshold');
                    process.exit(0);
                }
                else {
                    logger.error('Documentation coverage is not over threshold');
                    process.exit(1);
                }
            }
            else {
                resolve$$1();
            }
        });
    };
    Application.prototype.processPages = function () {
        var _this = this;
        logger.info('Process pages');
        var pages = this.configuration.pages;
        Promise.all(pages.map(function (page, i) {
            return new Promise(function (resolve$$1, reject) {
                logger.info('Process page', page.name);
                var htmlData = $htmlengine.render(_this.configuration.mainData, page);
                var finalPath = _this.configuration.mainData.output;
                if (_this.configuration.mainData.output.lastIndexOf('/') === -1) {
                    finalPath += '/';
                }
                if (page.path) {
                    finalPath += page.path + '/';
                }
                finalPath += page.name + '.html';
                $searchEngine.indexPage({
                    infos: page,
                    rawData: htmlData,
                    url: finalPath
                });
                fs.outputFile(path.resolve(finalPath), htmlData, function (err) {
                    if (err) {
                        logger.error('Error during ' + page.name + ' page generation');
                        reject();
                    }
                    else {
                        resolve$$1();
                    }
                });
            });
        })).then(function () {
            $searchEngine.generateSearchIndexJson(_this.configuration.mainData.output).then(function () {
                if (_this.configuration.mainData.additionalPages.length > 0) {
                    _this.processAdditionalPages();
                }
                else {
                    if (_this.configuration.mainData.assetsFolder !== '') {
                        _this.processAssetsFolder();
                    }
                    _this.processResources();
                }
            }, function (e) {
                logger.error(e);
            });
        })
            .catch(function (e) {
            logger.error(e);
        });
    };
    Application.prototype.processAdditionalPages = function () {
        var _this = this;
        logger.info('Process additional pages');
        var pages = this.configuration.mainData.additionalPages;
        Promise.all(pages.map(function (page, i) {
            return new Promise(function (resolve$$1, reject) {
                logger.info('Process page', pages[i].name);
                var htmlData = $htmlengine.render(_this.configuration.mainData, pages[i]);
                var finalPath = _this.configuration.mainData.output;
                if (_this.configuration.mainData.output.lastIndexOf('/') === -1) {
                    finalPath += '/';
                }
                if (pages[i].path) {
                    finalPath += pages[i].path + '/';
                }
                finalPath += pages[i].name + '.html';
                $searchEngine.indexPage({
                    infos: pages[i],
                    rawData: htmlData,
                    url: finalPath
                });
                fs.outputFile(path.resolve(finalPath), htmlData, function (err) {
                    if (err) {
                        logger.error('Error during ' + pages[i].name + ' page generation');
                        reject();
                    }
                    else {
                        resolve$$1();
                    }
                });
            });
        })).then(function () {
            $searchEngine.generateSearchIndexJson(_this.configuration.mainData.output).then(function () {
                if (_this.configuration.mainData.assetsFolder !== '') {
                    _this.processAssetsFolder();
                }
                _this.processResources();
            }, function (e) {
                logger.error(e);
            });
        })
            .catch(function (e) {
            logger.error(e);
        });
    };
    Application.prototype.processAssetsFolder = function () {
        logger.info('Copy assets folder');
        if (!fs.existsSync(this.configuration.mainData.assetsFolder)) {
            logger.error("Provided assets folder " + this.configuration.mainData.assetsFolder + " did not exist");
        }
        else {
            fs.copy(path.resolve(this.configuration.mainData.assetsFolder), path.resolve(process.cwd() + path.sep + this.configuration.mainData.output + path.sep + this.configuration.mainData.assetsFolder), function (err) {
                if (err) {
                    logger.error('Error during resources copy ', err);
                }
            });
        }
    };
    Application.prototype.processResources = function () {
        var _this = this;
        logger.info('Copy main resources');
        var onComplete = function () {
            var finalTime = (new Date() - startTime) / 1000;
            logger.info('Documentation generated in ' + _this.configuration.mainData.output + ' in ' + finalTime + ' seconds using ' + _this.configuration.mainData.theme + ' theme');
            if (_this.configuration.mainData.serve) {
                logger.info("Serving documentation from " + _this.configuration.mainData.output + " at http://127.0.0.1:" + _this.configuration.mainData.port);
                _this.runWebServer(_this.configuration.mainData.output);
            }
        };
        var finalOutput = this.configuration.mainData.output.replace(process.cwd(), '');
        fs.copy(path.resolve(__dirname + '/../src/resources/'), path.resolve(process.cwd() + path.sep + finalOutput), function (err) {
            if (err) {
                logger.error('Error during resources copy ', err);
            }
            else {
                if (_this.configuration.mainData.extTheme) {
                    fs.copy(path.resolve(process.cwd() + path.sep + _this.configuration.mainData.extTheme), path.resolve(process.cwd() + path.sep + finalOutput + '/styles/'), function (err) {
                        if (err) {
                            logger.error('Error during external styling theme copy ', err);
                        }
                        else {
                            logger.info('External styling theme copy succeeded');
                            onComplete();
                        }
                    });
                }
                else {
                    onComplete();
                }
            }
        });
    };
    Application.prototype.processGraphs = function () {
        var _this = this;
        if (this.configuration.mainData.disableGraph) {
            logger.info('Graph generation disabled');
            this.processPages();
        }
        else {
            logger.info('Process main graph');
            var finalMainGraphPath_1 = this.configuration.mainData.output;
            if (finalMainGraphPath_1.lastIndexOf('/') === -1) {
                finalMainGraphPath_1 += '/';
            }
            finalMainGraphPath_1 += 'graph';
            $ngdengine.renderGraph(this.configuration.mainData.tsconfig, path.resolve(finalMainGraphPath_1), 'p').then(function () {
                $ngdengine.readGraph(path.resolve(finalMainGraphPath_1 + path.sep + 'dependencies.svg'), 'Main graph').then(function (data) {
                    _this.configuration.mainData.mainGraph = data;
                    generateModulesGraph_1();
                }, function (err) {
                    logger.error('Error during graph read: ', err);
                });
            }, function (err) {
                logger.error('Error during graph generation: ', err);
            });
            var modules_1 = this.configuration.mainData.modules, generateModulesGraph_1 = function () {
                Promise.all(modules_1.map(function (module, i) {
                    return new Promise(function (resolve$$1, reject) {
                        logger.info('Process module graph', modules_1[i].name);
                        var finalPath = _this.configuration.mainData.output;
                        if (_this.configuration.mainData.output.lastIndexOf('/') === -1) {
                            finalPath += '/';
                        }
                        finalPath += 'modules/' + modules_1[i].name;
                        $ngdengine.renderGraph(modules_1[i].file, finalPath, 'f', modules_1[i].name).then(function () {
                            $ngdengine.readGraph(path.resolve(finalPath + path.sep + 'dependencies.svg'), modules_1[i].name).then(function (data) {
                                modules_1[i].graph = data;
                                resolve$$1();
                            }, function (err) {
                                logger.error('Error during graph read: ', err);
                            });
                        }, function (errorMessage) {
                            logger.error(errorMessage);
                            reject();
                        });
                    });
                })).then(function () {
                    _this.processPages();
                })
                    .catch(function (e) {
                    logger.error(e);
                });
            };
        }
    };
    Application.prototype.runWebServer = function (folder) {
        if (!this.isWatching) {
            LiveServer.start({
                root: folder,
                open: this.configuration.mainData.open,
                quiet: true,
                logLevel: 0,
                wait: 1000,
                port: this.configuration.mainData.port
            });
        }
        if (this.configuration.mainData.watch && !this.isWatching) {
            this.runWatch();
        }
        else if (this.configuration.mainData.watch && this.isWatching) {
            var srcFolder = findMainSourceFolder(this.files);
            logger.info("Already watching sources in " + srcFolder + " folder");
        }
    };
    Application.prototype.runWatch = function () {
        var _this = this;
        var sources = [findMainSourceFolder(this.files)], watcherReady = false;
        this.isWatching = true;
        logger.info("Watching sources in " + findMainSourceFolder(this.files) + " folder");
        if ($markdownengine.hasRootMarkdowns()) {
            sources = sources.concat($markdownengine.listRootMarkdowns());
        }
        if (this.configuration.mainData.includes !== '') {
            sources = sources.concat(this.configuration.mainData.includes);
        }
        var watcher = chokidar.watch(sources, {
            awaitWriteFinish: true,
            ignoreInitial: true,
            ignored: /(spec|\.d)\.ts/
        }), timerAddAndRemoveRef, timerChangeRef, waiterAddAndRemove = function () {
            clearTimeout(timerAddAndRemoveRef);
            timerAddAndRemoveRef = setTimeout(runnerAddAndRemove, 1000);
        }, runnerAddAndRemove = function () {
            startTime = new Date();
            _this.generate();
        }, waiterChange = function () {
            clearTimeout(timerChangeRef);
            timerChangeRef = setTimeout(runnerChange, 1000);
        }, runnerChange = function () {
            startTime = new Date();
            _this.setUpdatedFiles(_this.watchChangedFiles);
            if (_this.hasWatchedFilesTSFiles()) {
                _this.getMicroDependenciesData();
            }
            else if (_this.hasWatchedFilesRootMarkdownFiles()) {
                _this.rebuildRootMarkdowns();
            }
            else {
                _this.rebuildExternalDocumentation();
            }
        };
        watcher
            .on('ready', function () {
            if (!watcherReady) {
                watcherReady = true;
                watcher
                    .on('add', function (file) {
                    logger.debug("File " + file + " has been added");
                    // Test extension, if ts
                    // rescan everything
                    if (path.extname(file) === '.ts') {
                        waiterAddAndRemove();
                    }
                })
                    .on('change', function (file) {
                    logger.debug("File " + file + " has been changed");
                    // Test extension, if ts
                    // rescan only file
                    if (path.extname(file) === '.ts' || path.extname(file) === '.md' || path.extname(file) === '.json') {
                        _this.watchChangedFiles.push(path.join(process.cwd() + path.sep + file));
                        waiterChange();
                    }
                })
                    .on('unlink', function (file) {
                    logger.debug("File " + file + " has been removed");
                    // Test extension, if ts
                    // rescan everything
                    if (path.extname(file) === '.ts') {
                        waiterAddAndRemove();
                    }
                });
            }
        });
    };
    Object.defineProperty(Application.prototype, "application", {
        /**
         * Return the application / root component instance.
         */
        get: function () {
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Application.prototype, "isCLI", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    return Application;
}());

var pkg$2 = require('../package.json');
var program = require('commander');
var _$10 = require('lodash');
var glob$1 = require('glob');
var os = require('os');
var osName = require('os-name');
var files = [];
var cwd$1 = process.cwd();
process.setMaxListeners(0);
process.on('unhandledRejection', function (err) {
    logger.error(err);
    logger.error('Sorry, but there was a problem during parsing or generation of the documentation. Please fill an issue on github. (https://github.com/compodoc/compodoc/issues/new)');
    process.exit(1);
});
process.on('uncaughtException', function (err) {
    logger.error(err);
    logger.error('Sorry, but there was a problem during parsing or generation of the documentation. Please fill an issue on github. (https://github.com/compodoc/compodoc/issues/new)');
    process.exit(1);
});
var CliApplication = (function (_super) {
    __extends(CliApplication, _super);
    function CliApplication() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Run compodoc from the command line.
     */
    CliApplication.prototype.generate = function () {
        function list(val) {
            return val.split(',');
        }
        program
            .version(pkg$2.version)
            .usage('<src> [options]')
            .option('-p, --tsconfig [config]', 'A tsconfig.json file')
            .option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)', COMPODOC_DEFAULTS.folder)
            .option('-y, --extTheme [file]', 'External styling theme file')
            .option('-n, --name [name]', 'Title documentation', COMPODOC_DEFAULTS.title)
            .option('-a, --assetsFolder [folder]', 'External assets folder to copy in generated documentation folder')
            .option('-o, --open', 'Open the generated documentation', false)
            .option('-t, --silent', 'In silent mode, log messages aren\'t logged in the console', false)
            .option('-s, --serve', 'Serve generated documentation (default http://localhost:8080/)', false)
            .option('-r, --port [port]', 'Change default serving port', COMPODOC_DEFAULTS.port)
            .option('-w, --watch', 'Watch source files after serve and force documentation rebuild', false)
            .option('--theme [theme]', 'Choose one of available themes, default is \'gitbook\' (laravel, original, postmark, readthedocs, stripe, vagrant)')
            .option('--hideGenerator', 'Do not print the Compodoc link at the bottom of the page', false)
            .option('--toggleMenuItems <items>', 'Close by default items in the menu (default [\'all\']) values : [\'all\'] or one of these [\'modules\',\'components\',\'directives\',\'classes\',\'injectables\',\'interfaces\',\'pipes\',\'additionalPages\']', list, COMPODOC_DEFAULTS.toggleMenuItems)
            .option('--includes [path]', 'Path of external markdown files to include')
            .option('--includesName [name]', 'Name of item menu of externals markdown files (default "Additional documentation")', COMPODOC_DEFAULTS.additionalEntryName)
            .option('--coverageTest [threshold]', 'Test command of documentation coverage with a threshold (default 70)')
            .option('--disableSourceCode', 'Do not add source code tab and links to source code', false)
            .option('--disableGraph', 'Do not add the dependency graph', false)
            .option('--disableCoverage', 'Do not add the documentation coverage report', false)
            .option('--disablePrivateOrInternalSupport', 'Do not show private, @internal or Angular lifecycle hooks in generated documentation', false)
            .parse(process.argv);
        var outputHelp = function () {
            program.outputHelp();
            process.exit(1);
        };
        if (program.output) {
            this.configuration.mainData.output = program.output;
        }
        if (program.extTheme) {
            this.configuration.mainData.extTheme = program.extTheme;
        }
        if (program.theme) {
            this.configuration.mainData.theme = program.theme;
        }
        if (program.name) {
            this.configuration.mainData.documentationMainName = program.name;
        }
        if (program.assetsFolder) {
            this.configuration.mainData.assetsFolder = program.assetsFolder;
        }
        if (program.open) {
            this.configuration.mainData.open = program.open;
        }
        if (program.toggleMenuItems) {
            this.configuration.mainData.toggleMenuItems = program.toggleMenuItems;
        }
        if (program.includes) {
            this.configuration.mainData.includes = program.includes;
        }
        if (program.includesName) {
            this.configuration.mainData.includesName = program.includesName;
        }
        if (program.silent) {
            logger.silent = false;
        }
        if (program.serve) {
            this.configuration.mainData.serve = program.serve;
        }
        if (program.port) {
            this.configuration.mainData.port = program.port;
        }
        if (program.watch) {
            this.configuration.mainData.watch = program.watch;
        }
        if (program.hideGenerator) {
            this.configuration.mainData.hideGenerator = program.hideGenerator;
        }
        if (program.includes) {
            this.configuration.mainData.includes = program.includes;
        }
        if (program.includesName) {
            this.configuration.mainData.includesName = program.includesName;
        }
        if (program.coverageTest) {
            this.configuration.mainData.coverageTest = true;
            this.configuration.mainData.coverageTestThreshold = (typeof program.coverageTest === 'string') ? parseInt(program.coverageTest) : COMPODOC_DEFAULTS.defaultCoverageThreshold;
        }
        if (program.disableSourceCode) {
            this.configuration.mainData.disableSourceCode = program.disableSourceCode;
        }
        if (program.disableGraph) {
            this.configuration.mainData.disableGraph = program.disableGraph;
        }
        if (program.disableCoverage) {
            this.configuration.mainData.disableCoverage = program.disableCoverage;
        }
        if (program.disablePrivateOrInternalSupport) {
            this.configuration.mainData.disablePrivateOrInternalSupport = program.disablePrivateOrInternalSupport;
        }
        if (!this.isWatching) {
            console.log(fs.readFileSync(path.join(__dirname, '../src/resources/images/banner')).toString());
            console.log(pkg$2.version);
            console.log('');
            console.log("Node.js version : " + process.version);
            console.log('');
            console.log("Operating system : " + osName(os.platform(), os.release()));
            console.log('');
        }
        if (program.serve && !program.tsconfig && program.output) {
            // if -s & -d, serve it
            if (!fs.existsSync(program.output)) {
                logger.error(program.output + " folder doesn't exist");
                process.exit(1);
            }
            else {
                logger.info("Serving documentation from " + program.output + " at http://127.0.0.1:" + program.port);
                _super.prototype.runWebServer.call(this, program.output);
            }
        }
        else if (program.serve && !program.tsconfig && !program.output) {
            // if only -s find ./documentation, if ok serve, else error provide -d
            if (!fs.existsSync(program.output)) {
                logger.error('Provide output generated folder with -d flag');
                process.exit(1);
            }
            else {
                logger.info("Serving documentation from " + program.output + " at http://127.0.0.1:" + program.port);
                _super.prototype.runWebServer.call(this, program.output);
            }
        }
        else {
            if (program.hideGenerator) {
                this.configuration.mainData.hideGenerator = true;
            }
            var defaultWalkFOlder = cwd$1 || '.', walk_1 = function (dir, exclude) {
                var results = [];
                var list = fs.readdirSync(dir);
                list.forEach(function (file) {
                    var excludeTest = _$10.find(exclude, function (o) {
                        var globFiles = glob$1.sync(o, {
                            cwd: cwd$1
                        });
                        if (globFiles.length > 0) {
                            var fileNameForGlobSearch_1 = path.join(dir, file).replace(cwd$1 + path.sep, ''), resultGlobSearch = globFiles.findIndex(function (element) {
                                return element === fileNameForGlobSearch_1;
                            }), test = resultGlobSearch !== -1;
                            if (test) {
                                logger.warn('Excluding', path.join(dir, file));
                            }
                            return test;
                        }
                        else {
                            var test = path.basename(o) === file;
                            if (test) {
                                logger.warn('Excluding', path.join(dir, file));
                            }
                            return test;
                        }
                    });
                    if (typeof excludeTest === 'undefined' && dir.indexOf('node_modules') < 0) {
                        file = path.join(dir, file);
                        var stat = fs.statSync(file);
                        if (stat && stat.isDirectory()) {
                            results = results.concat(walk_1(file, exclude));
                        }
                        else if (/(spec|\.d)\.ts/.test(file)) {
                            logger.warn('Ignoring', file);
                        }
                        else if (path.extname(file) === '.ts') {
                            logger.debug('Including', file);
                            results.push(file);
                        }
                    }
                });
                return results;
            };
            if (program.tsconfig && program.args.length === 0) {
                this.configuration.mainData.tsconfig = program.tsconfig;
                if (!fs.existsSync(program.tsconfig)) {
                    logger.error("\"" + program.tsconfig + "\" file was not found in the current directory");
                    process.exit(1);
                }
                else {
                    var _file = path.join(path.join(process.cwd(), path.dirname(this.configuration.mainData.tsconfig)), path.basename(this.configuration.mainData.tsconfig));
                    // use the current directory of tsconfig.json as a working directory
                    cwd$1 = _file.split(path.sep).slice(0, -1).join(path.sep);
                    logger.info('Using tsconfig', _file);
                    var tsConfigFile = readConfig(_file);
                    files = tsConfigFile.files;
                    if (files) {
                        files = handlePath(files, cwd$1);
                    }
                    if (!files) {
                        var exclude = tsConfigFile.exclude || [];
                        files = walk_1(cwd$1 || '.', exclude);
                    }
                    _super.prototype.setFiles.call(this, files);
                    _super.prototype.generate.call(this);
                }
            }
            else if (program.tsconfig && program.args.length > 0 && program.coverageTest) {
                logger.info('Run documentation coverage test');
                this.configuration.mainData.tsconfig = program.tsconfig;
                if (!fs.existsSync(program.tsconfig)) {
                    logger.error("\"" + program.tsconfig + "\" file was not found in the current directory");
                    process.exit(1);
                }
                else {
                    var _file = path.join(path.join(process.cwd(), path.dirname(this.configuration.mainData.tsconfig)), path.basename(this.configuration.mainData.tsconfig));
                    // use the current directory of tsconfig.json as a working directory
                    cwd$1 = _file.split(path.sep).slice(0, -1).join(path.sep);
                    logger.info('Using tsconfig', _file);
                    var tsConfigFile = readConfig(_file);
                    files = tsConfigFile.files;
                    if (files) {
                        files = handlePath(files, cwd$1);
                    }
                    if (!files) {
                        var exclude = tsConfigFile.exclude || [];
                        files = walk_1(cwd$1 || '.', exclude);
                    }
                    _super.prototype.setFiles.call(this, files);
                    _super.prototype.testCoverage.call(this);
                }
            }
            else if (program.tsconfig && program.args.length > 0) {
                this.configuration.mainData.tsconfig = program.tsconfig;
                var sourceFolder = program.args[0];
                if (!fs.existsSync(sourceFolder)) {
                    logger.error("Provided source folder " + sourceFolder + " was not found in the current directory");
                    process.exit(1);
                }
                else {
                    logger.info('Using provided source folder');
                    if (!fs.existsSync(program.tsconfig)) {
                        logger.error("\"" + program.tsconfig + "\" file was not found in the current directory");
                        process.exit(1);
                    }
                    else {
                        var tsConfigFile = readConfig(program.tsconfig);
                        var exclude = tsConfigFile.exclude || [];
                        files = walk_1(path.resolve(sourceFolder), exclude);
                        _super.prototype.setFiles.call(this, files);
                        _super.prototype.generate.call(this);
                    }
                }
            }
            else {
                logger.error('tsconfig.json file was not found, please use -p flag');
                outputHelp();
            }
        }
    };
    return CliApplication;
}(Application));

exports.Application = Application;
exports.CliApplication = CliApplication;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2dnZXIudHMiLCIuLi9zcmMvdXRpbHMvYW5ndWxhci1hcGkudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvZGVwZW5kZW5jaWVzLmVuZ2luZS50cyIsIi4uL3NyYy91dGlscy9saW5rLXBhcnNlci50cyIsIi4uL3NyYy91dGlscy9kZWZhdWx0cy50cyIsIi4uL3NyYy9hcHAvY29uZmlndXJhdGlvbi50cyIsIi4uL3NyYy91dGlscy9hbmd1bGFyLXZlcnNpb24udHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvaHRtbC5lbmdpbmUuaGVscGVycy50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9odG1sLmVuZ2luZS50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9tYXJrZG93bi5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvZmlsZS5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvbmdkLmVuZ2luZS50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9zZWFyY2guZW5naW5lLnRzIiwiLi4vc3JjL3V0aWxpdGllcy50cyIsIi4uL3NyYy91dGlscy9yb3V0ZXIucGFyc2VyLnRzIiwiLi4vc3JjL3V0aWxzL2pzZG9jLnBhcnNlci50cyIsIi4uL3NyYy91dGlscy9hbmd1bGFyLWxpZmVjeWNsZXMtaG9va3MudHMiLCIuLi9zcmMvdXRpbHMvdXRpbHMudHMiLCIuLi9zcmMvdXRpbHMva2luZC10by10eXBlLnRzIiwiLi4vc3JjL2FwcC9jb21waWxlci9jb2RlZ2VuLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2NvbXBvbmVudHMtdHJlZS5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2NvbXBpbGVyL2RlcGVuZGVuY2llcy50cyIsIi4uL3NyYy91dGlscy9wcm9taXNlLXNlcXVlbnRpYWwudHMiLCIuLi9zcmMvYXBwL2FwcGxpY2F0aW9uLnRzIiwiLi4vc3JjL2luZGV4LWNsaS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJsZXQgZ3V0aWwgPSByZXF1aXJlKCdndWxwLXV0aWwnKVxubGV0IGMgPSBndXRpbC5jb2xvcnM7XG5sZXQgcGtnID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyk7XG5cbmVudW0gTEVWRUwge1xuXHRJTkZPLFxuXHRERUJVRyxcbiAgICBFUlJPUixcbiAgICBXQVJOXG59XG5cbmNsYXNzIExvZ2dlciB7XG5cblx0bmFtZTtcblx0bG9nZ2VyO1xuXHR2ZXJzaW9uO1xuXHRzaWxlbnQ7XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5uYW1lID0gcGtnLm5hbWU7XG5cdFx0dGhpcy52ZXJzaW9uID0gcGtnLnZlcnNpb247XG5cdFx0dGhpcy5sb2dnZXIgPSBndXRpbC5sb2c7XG5cdFx0dGhpcy5zaWxlbnQgPSB0cnVlO1xuXHR9XG5cblx0aW5mbyguLi5hcmdzKSB7XG5cdFx0aWYoIXRoaXMuc2lsZW50KSByZXR1cm47XG5cdFx0dGhpcy5sb2dnZXIoXG5cdFx0XHR0aGlzLmZvcm1hdChMRVZFTC5JTkZPLCAuLi5hcmdzKVxuXHRcdCk7XG5cdH1cblxuXHRlcnJvciguLi5hcmdzKSB7XG5cdFx0aWYoIXRoaXMuc2lsZW50KSByZXR1cm47XG5cdFx0dGhpcy5sb2dnZXIoXG5cdFx0XHR0aGlzLmZvcm1hdChMRVZFTC5FUlJPUiwgLi4uYXJncylcblx0XHQpO1xuXHR9XG5cbiAgICB3YXJuKC4uLmFyZ3MpIHtcblx0XHRpZighdGhpcy5zaWxlbnQpIHJldHVybjtcblx0XHR0aGlzLmxvZ2dlcihcblx0XHRcdHRoaXMuZm9ybWF0KExFVkVMLldBUk4sIC4uLmFyZ3MpXG5cdFx0KTtcblx0fVxuXG5cdGRlYnVnKC4uLmFyZ3MpIHtcblx0XHRpZighdGhpcy5zaWxlbnQpIHJldHVybjtcblx0XHR0aGlzLmxvZ2dlcihcblx0XHRcdHRoaXMuZm9ybWF0KExFVkVMLkRFQlVHLCAuLi5hcmdzKVxuXHRcdCk7XG5cdH1cblxuXHRwcml2YXRlIGZvcm1hdChsZXZlbCwgLi4uYXJncykge1xuXG5cdFx0bGV0IHBhZCA9IChzLCBsLCBjPScnKSA9PiB7XG5cdFx0XHRyZXR1cm4gcyArIEFycmF5KCBNYXRoLm1heCgwLCBsIC0gcy5sZW5ndGggKyAxKSkuam9pbiggYyApXG5cdFx0fTtcblxuXHRcdGxldCBtc2cgPSBhcmdzLmpvaW4oJyAnKTtcblx0XHRpZihhcmdzLmxlbmd0aCA+IDEpIHtcblx0XHRcdG1zZyA9IGAkeyBwYWQoYXJncy5zaGlmdCgpLCAxNSwgJyAnKSB9OiAkeyBhcmdzLmpvaW4oJyAnKSB9YDtcblx0XHR9XG5cblxuXHRcdHN3aXRjaChsZXZlbCkge1xuXHRcdFx0Y2FzZSBMRVZFTC5JTkZPOlxuXHRcdFx0XHRtc2cgPSBjLmdyZWVuKG1zZyk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIExFVkVMLkRFQlVHOlxuXHRcdFx0XHRtc2cgPSBjLmN5YW4obXNnKTtcblx0XHRcdFx0YnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgTEVWRUwuV0FSTjpcblx0XHRcdFx0bXNnID0gYy55ZWxsb3cobXNnKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgTEVWRUwuRVJST1I6XG5cdFx0XHRcdG1zZyA9IGMucmVkKG1zZyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiBbXG5cdFx0XHRtc2dcblx0XHRdLmpvaW4oJycpO1xuXHR9XG59XG5cbmV4cG9ydCBsZXQgbG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuIiwiY29uc3QgQW5ndWxhckFQSXMgPSByZXF1aXJlKCcuLi9zcmMvZGF0YS9hcGktbGlzdC5qc29uJyksXG4gICAgICBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kZXJJbkFuZ3VsYXJBUElzKHR5cGU6IHN0cmluZykge1xuICAgIGxldCBfcmVzdWx0ID0ge1xuICAgICAgICBzb3VyY2U6ICdleHRlcm5hbCcsXG4gICAgICAgIGRhdGE6IG51bGxcbiAgICB9O1xuXG4gICAgXy5mb3JFYWNoKEFuZ3VsYXJBUElzLCBmdW5jdGlvbihhbmd1bGFyTW9kdWxlQVBJcywgYW5ndWxhck1vZHVsZSkge1xuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSBhbmd1bGFyTW9kdWxlQVBJcy5sZW5ndGg7XG4gICAgICAgIGZvciAoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgaWYgKGFuZ3VsYXJNb2R1bGVBUElzW2ldLnRpdGxlID09PSB0eXBlKSB7XG4gICAgICAgICAgICAgICAgX3Jlc3VsdC5kYXRhID0gYW5ndWxhck1vZHVsZUFQSXNbaV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIF9yZXN1bHQ7XG59XG4iLCJpbXBvcnQgeyBmaW5kZXJJbkFuZ3VsYXJBUElzIH0gZnJvbSAnLi4vLi4vdXRpbHMvYW5ndWxhci1hcGknO1xuXG5pbXBvcnQgeyBQYXJzZWREYXRhIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9wYXJzZWQtZGF0YS5pbnRlcmZhY2UnO1xuaW1wb3J0IHsgTWlzY2VsbGFuZW91c0RhdGEgfSBmcm9tICcuLi9pbnRlcmZhY2VzL21pc2NlbGxhbmVvdXMtZGF0YS5pbnRlcmZhY2UnO1xuXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbmNsYXNzIERlcGVuZGVuY2llc0VuZ2luZSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOkRlcGVuZGVuY2llc0VuZ2luZSA9IG5ldyBEZXBlbmRlbmNpZXNFbmdpbmUoKTtcblxuICAgIHJhd0RhdGE6IFBhcnNlZERhdGE7XG4gICAgbW9kdWxlczogT2JqZWN0W107XG4gICAgcmF3TW9kdWxlczogT2JqZWN0W107XG4gICAgcmF3TW9kdWxlc0Zvck92ZXJ2aWV3OiBPYmplY3RbXTtcbiAgICBjb21wb25lbnRzOiBPYmplY3RbXTtcbiAgICBkaXJlY3RpdmVzOiBPYmplY3RbXTtcbiAgICBpbmplY3RhYmxlczogT2JqZWN0W107XG4gICAgaW50ZXJmYWNlczogT2JqZWN0W107XG4gICAgcm91dGVzOiBPYmplY3RbXTtcbiAgICBwaXBlczogT2JqZWN0W107XG4gICAgY2xhc3NlczogT2JqZWN0W107XG4gICAgbWlzY2VsbGFuZW91czogTWlzY2VsbGFuZW91c0RhdGE7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaWYoRGVwZW5kZW5jaWVzRW5naW5lLl9pbnN0YW5jZSl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yOiBJbnN0YW50aWF0aW9uIGZhaWxlZDogVXNlIERlcGVuZGVuY2llc0VuZ2luZS5nZXRJbnN0YW5jZSgpIGluc3RlYWQgb2YgbmV3LicpO1xuICAgICAgICB9XG4gICAgICAgIERlcGVuZGVuY2llc0VuZ2luZS5faW5zdGFuY2UgPSB0aGlzO1xuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKCk6RGVwZW5kZW5jaWVzRW5naW5lXG4gICAge1xuICAgICAgICByZXR1cm4gRGVwZW5kZW5jaWVzRW5naW5lLl9pbnN0YW5jZTtcbiAgICB9XG4gICAgY2xlYW5Nb2R1bGVzKG1vZHVsZXMpIHtcbiAgICAgICAgbGV0IF9tID0gbW9kdWxlcyxcbiAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gbW9kdWxlcy5sZW5ndGg7XG4gICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgaiA9IDAsXG4gICAgICAgICAgICAgICAgbGVuZyA9IF9tW2ldLmRlY2xhcmF0aW9ucy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IoajsgajxsZW5nOyBqKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgayA9IDAsXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0O1xuICAgICAgICAgICAgICAgIGlmIChfbVtpXS5kZWNsYXJhdGlvbnNbal0uanNkb2N0YWdzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxlbmd0ID0gX21baV0uZGVjbGFyYXRpb25zW2pdLmpzZG9jdGFncy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGZvcihrOyBrPGxlbmd0OyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBfbVtpXS5kZWNsYXJhdGlvbnNbal0uanNkb2N0YWdzW2tdLnBhcmVudDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoX21baV0uZGVjbGFyYXRpb25zW2pdLmNvbnN0cnVjdG9yT2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfbVtpXS5kZWNsYXJhdGlvbnNbal0uY29uc3RydWN0b3JPYmouanNkb2N0YWdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZW5ndCA9IF9tW2ldLmRlY2xhcmF0aW9uc1tqXS5jb25zdHJ1Y3Rvck9iai5qc2RvY3RhZ3MubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGs7IGs8bGVuZ3Q7IGsrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBfbVtpXS5kZWNsYXJhdGlvbnNbal0uY29uc3RydWN0b3JPYmouanNkb2N0YWdzW2tdLnBhcmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoX21baV0uZGVjbGFyYXRpb25zW2pdLm1ldGhvZHNDbGFzcyAmJiBfbVtpXS5kZWNsYXJhdGlvbnNbal0ubWV0aG9kc0NsYXNzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGwgPSAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoID0gX21baV0uZGVjbGFyYXRpb25zW2pdLm1ldGhvZHNDbGFzcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsOyBsPGxlbmd0aDsgbCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgX21baV0uZGVjbGFyYXRpb25zW2pdLm1ldGhvZHNDbGFzc1tsXS5qc2RvY3RhZ3M7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKF9tW2ldLmRlY2xhcmF0aW9uc1tqXS5wcm9wZXJ0aWVzQ2xhc3MgJiYgX21baV0uZGVjbGFyYXRpb25zW2pdLnByb3BlcnRpZXNDbGFzcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aCA9IF9tW2ldLmRlY2xhcmF0aW9uc1tqXS5wcm9wZXJ0aWVzQ2xhc3MubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBmb3IobDsgbDxsZW5ndGg7IGwrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIF9tW2ldLmRlY2xhcmF0aW9uc1tqXS5wcm9wZXJ0aWVzQ2xhc3NbbF0uanNkb2N0YWdzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfbTtcbiAgICB9XG4gICAgaW5pdChkYXRhOiBQYXJzZWREYXRhKSB7XG4gICAgICAgIHRoaXMucmF3RGF0YSA9IGRhdGE7XG4gICAgICAgIHRoaXMubW9kdWxlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5tb2R1bGVzLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMucmF3TW9kdWxlc0Zvck92ZXJ2aWV3ID0gXy5zb3J0QnkoXy5jbG9uZURlZXAodGhpcy5jbGVhbk1vZHVsZXMoZGF0YS5tb2R1bGVzKSksIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5yYXdNb2R1bGVzID0gXy5zb3J0QnkoXy5jbG9uZURlZXAodGhpcy5jbGVhbk1vZHVsZXMoZGF0YS5tb2R1bGVzKSksIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLmNvbXBvbmVudHMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLmRpcmVjdGl2ZXMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5pbmplY3RhYmxlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5pbmplY3RhYmxlcywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmludGVyZmFjZXMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEuaW50ZXJmYWNlcywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLnBpcGVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLnBpcGVzLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMuY2xhc3NlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5jbGFzc2VzLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMubWlzY2VsbGFuZW91cyA9IHRoaXMucmF3RGF0YS5taXNjZWxsYW5lb3VzO1xuICAgICAgICB0aGlzLnByZXBhcmVNaXNjZWxsYW5lb3VzKCk7XG4gICAgICAgIHRoaXMucm91dGVzID0gdGhpcy5yYXdEYXRhLnJvdXRlc1RyZWU7XG4gICAgICAgIHRoaXMuY2xlYW5SYXdNb2R1bGVzRm9yT3ZlcnZpZXcoKTtcbiAgICB9XG4gICAgZmluZCh0eXBlOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGZpbmRlckluQ29tcG9kb2NEZXBlbmRlbmNpZXMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBsZXQgX3Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiAnaW50ZXJuYWwnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdHlwZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUuaW5kZXhPZihkYXRhW2ldLm5hbWUpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3Jlc3VsdC5kYXRhID0gZGF0YVtpXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZXN1bHQ7XG4gICAgICAgIH0sXG4gICAgICAgICAgICByZXN1bHRJbkNvbXBvZG9jSW5qZWN0YWJsZXMgPSBmaW5kZXJJbkNvbXBvZG9jRGVwZW5kZW5jaWVzKHRoaXMuaW5qZWN0YWJsZXMpLFxuICAgICAgICAgICAgcmVzdWx0SW5Db21wb2RvY0ludGVyZmFjZXMgPSBmaW5kZXJJbkNvbXBvZG9jRGVwZW5kZW5jaWVzKHRoaXMuaW50ZXJmYWNlcyksXG4gICAgICAgICAgICByZXN1bHRJbkNvbXBvZG9jQ2xhc3NlcyA9IGZpbmRlckluQ29tcG9kb2NEZXBlbmRlbmNpZXModGhpcy5jbGFzc2VzKSxcbiAgICAgICAgICAgIHJlc3VsdEluQ29tcG9kb2NDb21wb25lbnRzID0gZmluZGVySW5Db21wb2RvY0RlcGVuZGVuY2llcyh0aGlzLmNvbXBvbmVudHMpLFxuICAgICAgICAgICAgcmVzdWx0SW5Bbmd1bGFyQVBJcyA9IGZpbmRlckluQW5ndWxhckFQSXModHlwZSlcblxuICAgICAgICBpZiAocmVzdWx0SW5Db21wb2RvY0luamVjdGFibGVzLmRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRJbkNvbXBvZG9jSW5qZWN0YWJsZXM7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0SW5Db21wb2RvY0ludGVyZmFjZXMuZGF0YSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdEluQ29tcG9kb2NJbnRlcmZhY2VzO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdEluQ29tcG9kb2NDbGFzc2VzLmRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRJbkNvbXBvZG9jQ2xhc3NlcztcbiAgICAgICAgfSBlbHNlIGlmIChyZXN1bHRJbkNvbXBvZG9jQ29tcG9uZW50cy5kYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0SW5Db21wb2RvY0NvbXBvbmVudHM7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0SW5Bbmd1bGFyQVBJcy5kYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0SW5Bbmd1bGFyQVBJcztcbiAgICAgICAgfVxuICAgIH1cbiAgICB1cGRhdGUodXBkYXRlZERhdGEpIHtcbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLm1vZHVsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgXy5mb3JFYWNoKHVwZGF0ZWREYXRhLm1vZHVsZXMsIChtb2R1bGUpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5tb2R1bGVzLCB7J25hbWUnOiBtb2R1bGUubmFtZX0pO1xuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlc1tfaW5kZXhdID0gbW9kdWxlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLmNvbXBvbmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgXy5mb3JFYWNoKHVwZGF0ZWREYXRhLmNvbXBvbmVudHMsIChjb21wb25lbnQpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5jb21wb25lbnRzLCB7J25hbWUnOiBjb21wb25lbnQubmFtZX0pO1xuICAgICAgICAgICAgICAgIHRoaXMuY29tcG9uZW50c1tfaW5kZXhdID0gY29tcG9uZW50O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLmRpcmVjdGl2ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgXy5mb3JFYWNoKHVwZGF0ZWREYXRhLmRpcmVjdGl2ZXMsIChkaXJlY3RpdmUpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5kaXJlY3RpdmVzLCB7J25hbWUnOiBkaXJlY3RpdmUubmFtZX0pO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlc1tfaW5kZXhdID0gZGlyZWN0aXZlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLmluamVjdGFibGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIF8uZm9yRWFjaCh1cGRhdGVkRGF0YS5pbmplY3RhYmxlcywgKGluamVjdGFibGUpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5pbmplY3RhYmxlcywgeyduYW1lJzogaW5qZWN0YWJsZS5uYW1lfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmplY3RhYmxlc1tfaW5kZXhdID0gaW5qZWN0YWJsZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cGRhdGVkRGF0YS5pbnRlcmZhY2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIF8uZm9yRWFjaCh1cGRhdGVkRGF0YS5pbnRlcmZhY2VzLCAoaW50KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IF9pbmRleCA9IF8uZmluZEluZGV4KHRoaXMuaW50ZXJmYWNlcywgeyduYW1lJzogaW50Lm5hbWV9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmludGVyZmFjZXNbX2luZGV4XSA9IGludDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cGRhdGVkRGF0YS5waXBlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEucGlwZXMsIChwaXBlKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IF9pbmRleCA9IF8uZmluZEluZGV4KHRoaXMucGlwZXMsIHsnbmFtZSc6IHBpcGUubmFtZX0pO1xuICAgICAgICAgICAgICAgIHRoaXMucGlwZXNbX2luZGV4XSA9IHBpcGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXBkYXRlZERhdGEuY2xhc3Nlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEuY2xhc3NlcywgKGNsYXNzZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBfaW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLmNsYXNzZXMsIHsnbmFtZSc6IGNsYXNzZS5uYW1lfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGFzc2VzW19pbmRleF0gPSBjbGFzc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogTWlzY2VsbGFuZW91cyB1cGRhdGVcbiAgICAgICAgICovXG4gICAgICAgIGlmICh1cGRhdGVkRGF0YS5taXNjZWxsYW5lb3VzLnZhcmlhYmxlcy5sZW5ndGggPiAwICkge1xuICAgICAgICAgICAgXy5mb3JFYWNoKHVwZGF0ZWREYXRhLm1pc2NlbGxhbmVvdXMudmFyaWFibGVzLCAodmFyaWFibGUpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5taXNjZWxsYW5lb3VzLnZhcmlhYmxlcywge1xuICAgICAgICAgICAgICAgICAgICAnbmFtZSc6IHZhcmlhYmxlLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICdmaWxlJzogdmFyaWFibGUuZmlsZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMubWlzY2VsbGFuZW91cy52YXJpYWJsZXNbX2luZGV4XSA9IHZhcmlhYmxlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLm1pc2NlbGxhbmVvdXMuZnVuY3Rpb25zLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEubWlzY2VsbGFuZW91cy5mdW5jdGlvbnMsIChmdW5jKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IF9pbmRleCA9IF8uZmluZEluZGV4KHRoaXMubWlzY2VsbGFuZW91cy5mdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgICAgICAgJ25hbWUnOiBmdW5jLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICdmaWxlJzogZnVuYy5maWxlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5taXNjZWxsYW5lb3VzLmZ1bmN0aW9uc1tfaW5kZXhdID0gZnVuYztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cGRhdGVkRGF0YS5taXNjZWxsYW5lb3VzLnR5cGVhbGlhc2VzLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEubWlzY2VsbGFuZW91cy50eXBlYWxpYXNlcywgKHR5cGVhbGlhcykgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBfaW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLm1pc2NlbGxhbmVvdXMudHlwZWFsaWFzZXMsIHtcbiAgICAgICAgICAgICAgICAgICAgJ25hbWUnOiB0eXBlYWxpYXMubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgJ2ZpbGUnOiB0eXBlYWxpYXMuZmlsZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMubWlzY2VsbGFuZW91cy50eXBlYWxpYXNlc1tfaW5kZXhdID0gdHlwZWFsaWFzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLm1pc2NlbGxhbmVvdXMuZW51bWVyYXRpb25zLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEubWlzY2VsbGFuZW91cy5lbnVtZXJhdGlvbnMsIChlbnVtZXJhdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBfaW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLm1pc2NlbGxhbmVvdXMuZW51bWVyYXRpb25zLCB7XG4gICAgICAgICAgICAgICAgICAgICduYW1lJzogZW51bWVyYXRpb24ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgJ2ZpbGUnOiBlbnVtZXJhdGlvbi5maWxlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5taXNjZWxsYW5lb3VzLmVudW1lcmF0aW9uc1tfaW5kZXhdID0gZW51bWVyYXRpb247XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXBkYXRlZERhdGEubWlzY2VsbGFuZW91cy50eXBlcy5sZW5ndGggPiAwICkge1xuICAgICAgICAgICAgXy5mb3JFYWNoKHVwZGF0ZWREYXRhLm1pc2NlbGxhbmVvdXMudHlwZXMsICh0eXApID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5taXNjZWxsYW5lb3VzLnR5cGVzLCB7XG4gICAgICAgICAgICAgICAgICAgICduYW1lJzogdHlwLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICdmaWxlJzogdHlwLmZpbGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLm1pc2NlbGxhbmVvdXMudHlwZXNbX2luZGV4XSA9IHR5cDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJlcGFyZU1pc2NlbGxhbmVvdXMoKTtcbiAgICB9XG4gICAgZmluZEluQ29tcG9kb2MobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBtZXJnZWREYXRhID0gXy5jb25jYXQoW10sIHRoaXMubW9kdWxlcywgdGhpcy5jb21wb25lbnRzLCB0aGlzLmRpcmVjdGl2ZXMsIHRoaXMuaW5qZWN0YWJsZXMsIHRoaXMuaW50ZXJmYWNlcywgdGhpcy5waXBlcywgdGhpcy5jbGFzc2VzKSxcbiAgICAgICAgICAgIHJlc3VsdCA9IF8uZmluZChtZXJnZWREYXRhLCB7J25hbWUnOiBuYW1lfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQgfHwgZmFsc2U7XG4gICAgfVxuICAgIGNsZWFuUmF3TW9kdWxlc0Zvck92ZXJ2aWV3KCkge1xuICAgICAgICBfLmZvckVhY2godGhpcy5yYXdNb2R1bGVzRm9yT3ZlcnZpZXcsIChtb2R1bGUpID0+IHtcbiAgICAgICAgICAgIG1vZHVsZS5kZWNsYXJhdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIG1vZHVsZS5wcm92aWRlcnMgPSBbXTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHByZXBhcmVNaXNjZWxsYW5lb3VzKCkge1xuICAgICAgICAvL2dyb3VwIGVhY2ggc3ViZ291cCBieSBmaWxlXG4gICAgICAgIHRoaXMubWlzY2VsbGFuZW91cy5ncm91cGVkVmFyaWFibGVzID0gXy5ncm91cEJ5KHRoaXMubWlzY2VsbGFuZW91cy52YXJpYWJsZXMsICdmaWxlJyk7XG4gICAgICAgIHRoaXMubWlzY2VsbGFuZW91cy5ncm91cGVkRnVuY3Rpb25zID0gXy5ncm91cEJ5KHRoaXMubWlzY2VsbGFuZW91cy5mdW5jdGlvbnMsICdmaWxlJyk7XG4gICAgICAgIHRoaXMubWlzY2VsbGFuZW91cy5ncm91cGVkRW51bWVyYXRpb25zID0gXy5ncm91cEJ5KHRoaXMubWlzY2VsbGFuZW91cy5lbnVtZXJhdGlvbnMsICdmaWxlJyk7XG4gICAgfVxuICAgIGdldE1vZHVsZShuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIF8uZmluZCh0aGlzLm1vZHVsZXMsIFsnbmFtZScsIG5hbWVdKTtcbiAgICB9XG4gICAgZ2V0UmF3TW9kdWxlKG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gXy5maW5kKHRoaXMucmF3TW9kdWxlcywgWyduYW1lJywgbmFtZV0pO1xuICAgIH1cbiAgICBnZXRNb2R1bGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb2R1bGVzO1xuICAgIH1cbiAgICBnZXRDb21wb25lbnRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzO1xuICAgIH1cbiAgICBnZXREaXJlY3RpdmVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kaXJlY3RpdmVzO1xuICAgIH1cbiAgICBnZXRJbmplY3RhYmxlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5qZWN0YWJsZXM7XG4gICAgfVxuICAgIGdldEludGVyZmFjZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVyZmFjZXM7XG4gICAgfVxuICAgIGdldFJvdXRlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm91dGVzO1xuICAgIH1cbiAgICBnZXRQaXBlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGlwZXM7XG4gICAgfVxuICAgIGdldENsYXNzZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNsYXNzZXM7XG4gICAgfVxuICAgIGdldE1pc2NlbGxhbmVvdXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pc2NlbGxhbmVvdXM7XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0ICRkZXBlbmRlbmNpZXNFbmdpbmUgPSBEZXBlbmRlbmNpZXNFbmdpbmUuZ2V0SW5zdGFuY2UoKTtcbiIsImltcG9ydCB7ICRkZXBlbmRlbmNpZXNFbmdpbmUgfSBmcm9tICcuLi9hcHAvZW5naW5lcy9kZXBlbmRlbmNpZXMuZW5naW5lJztcblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RMZWFkaW5nVGV4dChzdHJpbmcsIGNvbXBsZXRlVGFnKSB7XG4gICAgdmFyIHRhZ0luZGV4ID0gc3RyaW5nLmluZGV4T2YoY29tcGxldGVUYWcpO1xuICAgIHZhciBsZWFkaW5nVGV4dCA9IG51bGw7XG4gICAgdmFyIGxlYWRpbmdUZXh0UmVnRXhwID0gL1xcWyguKz8pXFxdL2c7XG4gICAgdmFyIGxlYWRpbmdUZXh0SW5mbyA9IGxlYWRpbmdUZXh0UmVnRXhwLmV4ZWMoc3RyaW5nKTtcblxuICAgIC8vIGRpZCB3ZSBmaW5kIGxlYWRpbmcgdGV4dCwgYW5kIGlmIHNvLCBkb2VzIGl0IGltbWVkaWF0ZWx5IHByZWNlZGUgdGhlIHRhZz9cbiAgICB3aGlsZSAobGVhZGluZ1RleHRJbmZvICYmIGxlYWRpbmdUZXh0SW5mby5sZW5ndGgpIHtcbiAgICAgICAgaWYgKGxlYWRpbmdUZXh0SW5mby5pbmRleCArIGxlYWRpbmdUZXh0SW5mb1swXS5sZW5ndGggPT09IHRhZ0luZGV4KSB7XG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShsZWFkaW5nVGV4dEluZm9bMF0sICcnKTtcbiAgICAgICAgICAgIGxlYWRpbmdUZXh0ID0gbGVhZGluZ1RleHRJbmZvWzFdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBsZWFkaW5nVGV4dEluZm8gPSBsZWFkaW5nVGV4dFJlZ0V4cC5leGVjKHN0cmluZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbGVhZGluZ1RleHQ6IGxlYWRpbmdUZXh0LFxuICAgICAgICBzdHJpbmc6IHN0cmluZ1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGxpdExpbmtUZXh0KHRleHQpIHtcbiAgICB2YXIgbGlua1RleHQ7XG4gICAgdmFyIHRhcmdldDtcbiAgICB2YXIgc3BsaXRJbmRleDtcblxuICAgIC8vIGlmIGEgcGlwZSBpcyBub3QgcHJlc2VudCwgd2Ugc3BsaXQgb24gdGhlIGZpcnN0IHNwYWNlXG4gICAgc3BsaXRJbmRleCA9IHRleHQuaW5kZXhPZignfCcpO1xuICAgIGlmIChzcGxpdEluZGV4ID09PSAtMSkge1xuICAgICAgICBzcGxpdEluZGV4ID0gdGV4dC5zZWFyY2goL1xccy8pO1xuICAgIH1cblxuICAgIGlmIChzcGxpdEluZGV4ICE9PSAtMSkge1xuICAgICAgICBsaW5rVGV4dCA9IHRleHQuc3Vic3RyKHNwbGl0SW5kZXggKyAxKTtcbiAgICAgICAgLy8gTm9ybWFsaXplIHN1YnNlcXVlbnQgbmV3bGluZXMgdG8gYSBzaW5nbGUgc3BhY2UuXG4gICAgICAgIGxpbmtUZXh0ID0gbGlua1RleHQucmVwbGFjZSgvXFxuKy8sICcgJyk7XG4gICAgICAgIHRhcmdldCA9IHRleHQuc3Vic3RyKDAsIHNwbGl0SW5kZXgpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGxpbmtUZXh0OiBsaW5rVGV4dCxcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQgfHwgdGV4dFxuICAgIH07XG59XG5cbmV4cG9ydCBsZXQgTGlua1BhcnNlciA9IChmdW5jdGlvbigpIHtcblxuICAgIHZhciBwcm9jZXNzVGhlTGluayA9IGZ1bmN0aW9uKHN0cmluZywgdGFnSW5mbykge1xuICAgICAgICB2YXIgbGVhZGluZyA9IGV4dHJhY3RMZWFkaW5nVGV4dChzdHJpbmcsIHRhZ0luZm8uY29tcGxldGVUYWcpLFxuICAgICAgICAgICAgbGlua1RleHQgPSBsZWFkaW5nLmxlYWRpbmdUZXh0IHx8ICcnLFxuICAgICAgICAgICAgc3BsaXQsXG4gICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICBzdHJpbmd0b1JlcGxhY2U7XG5cbiAgICAgICAgc3BsaXQgPSBzcGxpdExpbmtUZXh0KHRhZ0luZm8udGV4dCk7XG4gICAgICAgIHRhcmdldCA9IHNwbGl0LnRhcmdldDtcblxuICAgICAgICBpZiAobGVhZGluZy5sZWFkaW5nVGV4dCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgc3RyaW5ndG9SZXBsYWNlID0gJ1snICsgbGVhZGluZy5sZWFkaW5nVGV4dCArICddJyArIHRhZ0luZm8uY29tcGxldGVUYWc7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNwbGl0LmxpbmtUZXh0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgc3RyaW5ndG9SZXBsYWNlID0gdGFnSW5mby5jb21wbGV0ZVRhZztcbiAgICAgICAgICAgIGxpbmtUZXh0ID0gc3BsaXQubGlua1RleHQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2Uoc3RyaW5ndG9SZXBsYWNlLCAnWycgKyBsaW5rVGV4dCArICddKCcgKyB0YXJnZXQgKyAnKScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRcbiAgICAgKiB7QGxpbmsgaHR0cDovL3d3dy5nb29nbGUuY29tfEdvb2dsZX0gb3Ige0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbSBHaXRIdWJ9IHRvIFtHaXRodWJdKGh0dHBzOi8vZ2l0aHViLmNvbSlcbiAgICAgKi9cblxuICAgIHZhciByZXBsYWNlTGlua1RhZyA9IGZ1bmN0aW9uKHN0cjogc3RyaW5nKSB7XG5cbiAgICAgICAgdmFyIHRhZ1JlZ0V4cCA9IG5ldyBSZWdFeHAoJ1xcXFx7QGxpbmtcXFxccysoKD86LnxcXG4pKz8pXFxcXH0nLCAnaScpLFxuICAgICAgICAgICAgbWF0Y2hlcyxcbiAgICAgICAgICAgIHByZXZpb3VzU3RyaW5nLFxuICAgICAgICAgICAgdGFnSW5mbyA9IFtdO1xuXG4gICAgICAgIGZ1bmN0aW9uIHJlcGxhY2VNYXRjaChyZXBsYWNlciwgdGFnLCBtYXRjaCwgdGV4dCkge1xuICAgICAgICAgICAgdmFyIG1hdGNoZWRUYWcgPSB7XG4gICAgICAgICAgICAgICAgY29tcGxldGVUYWc6IG1hdGNoLFxuICAgICAgICAgICAgICAgIHRhZzogdGFnLFxuICAgICAgICAgICAgICAgIHRleHQ6IHRleHRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0YWdJbmZvLnB1c2gobWF0Y2hlZFRhZyk7XG5cbiAgICAgICAgICAgIHJldHVybiByZXBsYWNlcihzdHIsIG1hdGNoZWRUYWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgbWF0Y2hlcyA9IHRhZ1JlZ0V4cC5leGVjKHN0cik7XG4gICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICAgIHByZXZpb3VzU3RyaW5nID0gc3RyO1xuICAgICAgICAgICAgICAgIHN0ciA9IHJlcGxhY2VNYXRjaChwcm9jZXNzVGhlTGluaywgJ2xpbmsnLCBtYXRjaGVzWzBdLCBtYXRjaGVzWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSB3aGlsZSAobWF0Y2hlcyAmJiBwcmV2aW91c1N0cmluZyAhPT0gc3RyKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmV3U3RyaW5nOiBzdHJcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgX3Jlc29sdmVMaW5rcyA9IGZ1bmN0aW9uKHN0cjogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiByZXBsYWNlTGlua1RhZyhzdHIpLm5ld1N0cmluZztcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXNvbHZlTGlua3M6IF9yZXNvbHZlTGlua3NcbiAgICB9XG59KSgpO1xuIiwiZXhwb3J0IGNvbnN0IENPTVBPRE9DX0RFRkFVTFRTID0ge1xuICAgIHRpdGxlOiAnQXBwbGljYXRpb24gZG9jdW1lbnRhdGlvbicsXG4gICAgYWRkaXRpb25hbEVudHJ5TmFtZTogJ0FkZGl0aW9uYWwgZG9jdW1lbnRhdGlvbicsXG4gICAgYWRkaXRpb25hbEVudHJ5UGF0aDogJ2FkZGl0aW9uYWwtZG9jdW1lbnRhdGlvbicsXG4gICAgZm9sZGVyOiAnLi9kb2N1bWVudGF0aW9uLycsXG4gICAgcG9ydDogODA4MCxcbiAgICB0aGVtZTogJ2dpdGJvb2snLFxuICAgIGJhc2U6ICcvJyxcbiAgICBkZWZhdWx0Q292ZXJhZ2VUaHJlc2hvbGQ6IDcwLFxuICAgIHRvZ2dsZU1lbnVJdGVtczogWydhbGwnXSxcbiAgICBkaXNhYmxlU291cmNlQ29kZTogZmFsc2UsXG4gICAgZGlzYWJsZUdyYXBoOiBmYWxzZSxcbiAgICBkaXNhYmxlQ292ZXJhZ2U6IGZhbHNlLFxuICAgIGRpc2FibGVQcml2YXRlT3JJbnRlcm5hbFN1cHBvcnQ6IGZhbHNlLFxuICAgIFBBR0VfVFlQRVM6IHtcbiAgICAgICAgUk9PVDogJ3Jvb3QnLFxuICAgICAgICBJTlRFUk5BTDogJ2ludGVybmFsJ1xuICAgIH1cbn1cbiIsImltcG9ydCB7IENPTVBPRE9DX0RFRkFVTFRTIH0gZnJvbSAnLi4vdXRpbHMvZGVmYXVsdHMnO1xuXG5pbXBvcnQgeyBQYWdlSW50ZXJmYWNlIH0gZnJvbSAnLi9pbnRlcmZhY2VzL3BhZ2UuaW50ZXJmYWNlJztcblxuaW1wb3J0IHsgTWFpbkRhdGFJbnRlcmZhY2UgfSBmcm9tICcuL2ludGVyZmFjZXMvbWFpbi1kYXRhLmludGVyZmFjZSc7XG5cbmltcG9ydCB7IENvbmZpZ3VyYXRpb25JbnRlcmZhY2UgfSBmcm9tICcuL2ludGVyZmFjZXMvY29uZmlndXJhdGlvbi5pbnRlcmZhY2UnO1xuXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbmV4cG9ydCBjbGFzcyBDb25maWd1cmF0aW9uIGltcGxlbWVudHMgQ29uZmlndXJhdGlvbkludGVyZmFjZSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOkNvbmZpZ3VyYXRpb24gPSBuZXcgQ29uZmlndXJhdGlvbigpO1xuXG4gICAgcHJpdmF0ZSBfcGFnZXM6UGFnZUludGVyZmFjZVtdID0gW107XG4gICAgcHJpdmF0ZSBfbWFpbkRhdGE6IE1haW5EYXRhSW50ZXJmYWNlID0ge1xuICAgICAgICBvdXRwdXQ6IENPTVBPRE9DX0RFRkFVTFRTLmZvbGRlcixcbiAgICAgICAgdGhlbWU6IENPTVBPRE9DX0RFRkFVTFRTLnRoZW1lLFxuICAgICAgICBleHRUaGVtZTogJycsXG4gICAgICAgIHNlcnZlOiBmYWxzZSxcbiAgICAgICAgcG9ydDogQ09NUE9ET0NfREVGQVVMVFMucG9ydCxcbiAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgIGFzc2V0c0ZvbGRlcjogJycsXG4gICAgICAgIGRvY3VtZW50YXRpb25NYWluTmFtZTogQ09NUE9ET0NfREVGQVVMVFMudGl0bGUsXG4gICAgICAgIGRvY3VtZW50YXRpb25NYWluRGVzY3JpcHRpb246ICcnLFxuICAgICAgICBiYXNlOiBDT01QT0RPQ19ERUZBVUxUUy5iYXNlLFxuICAgICAgICBoaWRlR2VuZXJhdG9yOiBmYWxzZSxcbiAgICAgICAgbW9kdWxlczogW10sXG4gICAgICAgIHJlYWRtZTogZmFsc2UsXG4gICAgICAgIGNoYW5nZWxvZzogJycsXG4gICAgICAgIGNvbnRyaWJ1dGluZzogJycsXG4gICAgICAgIGxpY2Vuc2U6ICcnLFxuICAgICAgICB0b2RvOiAnJyxcbiAgICAgICAgbWFya2Rvd25zOiBbXSxcbiAgICAgICAgYWRkaXRpb25hbFBhZ2VzOiBbXSxcbiAgICAgICAgcGlwZXM6IFtdLFxuICAgICAgICBjbGFzc2VzOiBbXSxcbiAgICAgICAgaW50ZXJmYWNlczogW10sXG4gICAgICAgIGNvbXBvbmVudHM6IFtdLFxuICAgICAgICBkaXJlY3RpdmVzOiBbXSxcbiAgICAgICAgaW5qZWN0YWJsZXM6IFtdLFxuICAgICAgICBtaXNjZWxsYW5lb3VzOiBbXSxcbiAgICAgICAgcm91dGVzOiBbXSxcbiAgICAgICAgdHNjb25maWc6ICcnLFxuICAgICAgICB0b2dnbGVNZW51SXRlbXM6IFtdLFxuICAgICAgICBpbmNsdWRlczogJycsXG4gICAgICAgIGluY2x1ZGVzTmFtZTogQ09NUE9ET0NfREVGQVVMVFMuYWRkaXRpb25hbEVudHJ5TmFtZSxcbiAgICAgICAgaW5jbHVkZXNGb2xkZXI6IENPTVBPRE9DX0RFRkFVTFRTLmFkZGl0aW9uYWxFbnRyeVBhdGgsXG4gICAgICAgIGRpc2FibGVTb3VyY2VDb2RlOiBDT01QT0RPQ19ERUZBVUxUUy5kaXNhYmxlU291cmNlQ29kZSxcbiAgICAgICAgZGlzYWJsZUdyYXBoOiBDT01QT0RPQ19ERUZBVUxUUy5kaXNhYmxlR3JhcGgsXG4gICAgICAgIGRpc2FibGVDb3ZlcmFnZTogQ09NUE9ET0NfREVGQVVMVFMuZGlzYWJsZUNvdmVyYWdlLFxuICAgICAgICBkaXNhYmxlUHJpdmF0ZU9ySW50ZXJuYWxTdXBwb3J0OiBDT01QT0RPQ19ERUZBVUxUUy5kaXNhYmxlUHJpdmF0ZU9ySW50ZXJuYWxTdXBwb3J0LFxuICAgICAgICB3YXRjaDogZmFsc2UsXG4gICAgICAgIG1haW5HcmFwaDogJycsXG4gICAgICAgIGNvdmVyYWdlVGVzdDogZmFsc2UsXG4gICAgICAgIGNvdmVyYWdlVGVzdFRocmVzaG9sZDogQ09NUE9ET0NfREVGQVVMVFMuZGVmYXVsdENvdmVyYWdlVGhyZXNob2xkLFxuICAgICAgICByb3V0ZXNMZW5ndGg6IDAsXG4gICAgICAgIGFuZ3VsYXJWZXJzaW9uOiAnJ1xuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaWYoQ29uZmlndXJhdGlvbi5faW5zdGFuY2Upe1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvcjogSW5zdGFudGlhdGlvbiBmYWlsZWQ6IFVzZSBDb25maWd1cmF0aW9uLmdldEluc3RhbmNlKCkgaW5zdGVhZCBvZiBuZXcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgQ29uZmlndXJhdGlvbi5faW5zdGFuY2UgPSB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0SW5zdGFuY2UoKTpDb25maWd1cmF0aW9uXG4gICAge1xuICAgICAgICByZXR1cm4gQ29uZmlndXJhdGlvbi5faW5zdGFuY2U7XG4gICAgfVxuXG4gICAgYWRkUGFnZShwYWdlOiBQYWdlSW50ZXJmYWNlKSB7XG4gICAgICAgIHRoaXMuX3BhZ2VzLnB1c2gocGFnZSk7XG4gICAgfVxuXG4gICAgYWRkQWRkaXRpb25hbFBhZ2UocGFnZTogUGFnZUludGVyZmFjZSkge1xuICAgICAgICB0aGlzLl9tYWluRGF0YS5hZGRpdGlvbmFsUGFnZXMucHVzaChwYWdlKTtcbiAgICB9XG5cbiAgICByZXNldFBhZ2VzKCkge1xuICAgICAgICB0aGlzLl9wYWdlcyA9IFtdO1xuICAgIH1cblxuICAgIHJlc2V0QWRkaXRpb25hbFBhZ2VzKCkge1xuICAgICAgICB0aGlzLl9tYWluRGF0YS5hZGRpdGlvbmFsUGFnZXMgPSBbXTtcbiAgICB9XG5cbiAgICByZXNldFJvb3RNYXJrZG93blBhZ2VzKCkge1xuICAgICAgICBsZXQgaW5kZXhQYWdlID0gXy5maW5kSW5kZXgodGhpcy5fcGFnZXMsIHsnbmFtZSc6ICdpbmRleCd9KTtcbiAgICAgICAgdGhpcy5fcGFnZXMuc3BsaWNlKGluZGV4UGFnZSwgMSk7XG4gICAgICAgIGluZGV4UGFnZSA9IF8uZmluZEluZGV4KHRoaXMuX3BhZ2VzLCB7J25hbWUnOiAnY2hhbmdlbG9nJ30pO1xuICAgICAgICB0aGlzLl9wYWdlcy5zcGxpY2UoaW5kZXhQYWdlLCAxKTtcbiAgICAgICAgaW5kZXhQYWdlID0gXy5maW5kSW5kZXgodGhpcy5fcGFnZXMsIHsnbmFtZSc6ICdjb250cmlidXRpbmcnfSk7XG4gICAgICAgIHRoaXMuX3BhZ2VzLnNwbGljZShpbmRleFBhZ2UsIDEpO1xuICAgICAgICBpbmRleFBhZ2UgPSBfLmZpbmRJbmRleCh0aGlzLl9wYWdlcywgeyduYW1lJzogJ2xpY2Vuc2UnfSk7XG4gICAgICAgIHRoaXMuX3BhZ2VzLnNwbGljZShpbmRleFBhZ2UsIDEpO1xuICAgICAgICBpbmRleFBhZ2UgPSBfLmZpbmRJbmRleCh0aGlzLl9wYWdlcywgeyduYW1lJzogJ3RvZG8nfSk7XG4gICAgICAgIHRoaXMuX3BhZ2VzLnNwbGljZShpbmRleFBhZ2UsIDEpO1xuICAgICAgICB0aGlzLl9tYWluRGF0YS5tYXJrZG93bnMgPSBbXTtcbiAgICB9XG5cbiAgICBnZXQgcGFnZXMoKTpQYWdlSW50ZXJmYWNlW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFnZXM7XG4gICAgfVxuICAgIHNldCBwYWdlcyhwYWdlczpQYWdlSW50ZXJmYWNlW10pIHtcbiAgICAgICAgdGhpcy5fcGFnZXMgPSBbXTtcbiAgICB9XG5cbiAgICBnZXQgbWFpbkRhdGEoKTpNYWluRGF0YUludGVyZmFjZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tYWluRGF0YTtcbiAgICB9XG4gICAgc2V0IG1haW5EYXRhKGRhdGE6TWFpbkRhdGFJbnRlcmZhY2UpIHtcbiAgICAgICAgKDxhbnk+T2JqZWN0KS5hc3NpZ24odGhpcy5fbWFpbkRhdGEsIGRhdGEpO1xuICAgIH1cbn07XG4iLCJsZXQgc2VtdmVyID0gcmVxdWlyZSgnc2VtdmVyJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhblZlcnNpb24odmVyc2lvbikge1xuICAgIHJldHVybiB2ZXJzaW9uLnJlcGxhY2UoJ34nLCAnJylcbiAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCdeJywgJycpXG4gICAgICAgICAgICAgICAgICAucmVwbGFjZSgnPScsICcnKVxuICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoJzwnLCAnJylcbiAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCc+JywgJycpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbmd1bGFyVmVyc2lvbk9mUHJvamVjdChwYWNrYWdlRGF0YSkge1xuICAgIGxldCBfcmVzdWx0ID0gJyc7XG5cbiAgICBpZiAocGFja2FnZURhdGFbJ2RlcGVuZGVuY2llcyddKSB7XG4gICAgICAgIGxldCBhbmd1bGFyQ29yZSA9IHBhY2thZ2VEYXRhWydkZXBlbmRlbmNpZXMnXVsnQGFuZ3VsYXIvY29yZSddO1xuICAgICAgICBpZiAoYW5ndWxhckNvcmUpIHtcbiAgICAgICAgICAgIF9yZXN1bHQgPSBjbGVhblZlcnNpb24oYW5ndWxhckNvcmUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF9yZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGlzQW5ndWxhclZlcnNpb25BcmNoaXZlZCh2ZXJzaW9uKSB7XG4gICAgbGV0IHJlc3VsdDtcblxuICAgIHRyeSB7XG4gICAgICAgIHJlc3VsdCA9IHNlbXZlci5jb21wYXJlKHZlcnNpb24sICcyLjQuMTAnKSA8PSAwO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJlZml4T2ZmaWNpYWxEb2ModmVyc2lvbikge1xuICAgIHJldHVybiBpc0FuZ3VsYXJWZXJzaW9uQXJjaGl2ZWQodmVyc2lvbikgPyAndjIuJyA6ICcnO1xufVxuIiwiaW1wb3J0ICogYXMgSGFuZGxlYmFycyBmcm9tICdoYW5kbGViYXJzJztcbmltcG9ydCB7IENPTVBPRE9DX0RFRkFVTFRTIH0gZnJvbSAnLi4vLi4vdXRpbHMvZGVmYXVsdHMnO1xuaW1wb3J0IHsgJGRlcGVuZGVuY2llc0VuZ2luZSB9IGZyb20gJy4vZGVwZW5kZW5jaWVzLmVuZ2luZSc7XG5pbXBvcnQgeyBleHRyYWN0TGVhZGluZ1RleHQsIHNwbGl0TGlua1RleHQgfSBmcm9tICcuLi8uLi91dGlscy9saW5rLXBhcnNlcic7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vY29uZmlndXJhdGlvbic7XG5pbXBvcnQgeyBwcmVmaXhPZmZpY2lhbERvYyB9IGZyb20gJy4uLy4uL3V0aWxzL2FuZ3VsYXItdmVyc2lvbic7XG5cbmltcG9ydCB7IGpzZG9jVGFnSW50ZXJmYWNlIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9qc2RvYy10YWcuaW50ZXJmYWNlJztcblxuZXhwb3J0IGxldCBIdG1sRW5naW5lSGVscGVycyA9IChmdW5jdGlvbigpIHtcbiAgICBsZXQgaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvL1RPRE8gdXNlIHRoaXMgaW5zdGVhZCA6IGh0dHBzOi8vZ2l0aHViLmNvbS9hc3NlbWJsZS9oYW5kbGViYXJzLWhlbHBlcnNcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciggXCJjb21wYXJlXCIsIGZ1bmN0aW9uKGEsIG9wZXJhdG9yLCBiLCBvcHRpb25zKSB7XG4gICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCA0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2hhbmRsZWJhcnMgSGVscGVyIHt7Y29tcGFyZX19IGV4cGVjdHMgNCBhcmd1bWVudHMnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgIHN3aXRjaCAob3BlcmF0b3IpIHtcbiAgICAgICAgICAgIGNhc2UgJ2luZGV4b2YnOlxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IChiLmluZGV4T2YoYSkgIT09IC0xKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJz09PSc6XG4gICAgICAgICAgICAgIHJlc3VsdCA9IGEgPT09IGI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnIT09JzpcbiAgICAgICAgICAgICAgcmVzdWx0ID0gYSAhPT0gYjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgcmVzdWx0ID0gYSA+IGI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2hlbHBlciB7e2NvbXBhcmV9fTogaW52YWxpZCBvcGVyYXRvcjogYCcgKyBvcGVyYXRvciArICdgJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcihcIm9yXCIsIGZ1bmN0aW9uKC8qIGFueSwgYW55LCAuLi4sIG9wdGlvbnMgKi8pIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSBhcmd1bWVudHMubGVuZ3RoIC0gMTtcbiAgICAgICAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50c1tsZW5dO1xuXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgaWYgKGFyZ3VtZW50c1tpXSkge1xuICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcihcImZpbHRlckFuZ3VsYXIyTW9kdWxlc1wiLCBmdW5jdGlvbih0ZXh0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICBjb25zdCBORzJfTU9EVUxFUzpzdHJpbmdbXSA9IFtcbiAgICAgICAgICAgICAgICAnQnJvd3Nlck1vZHVsZScsXG4gICAgICAgICAgICAgICAgJ0Zvcm1zTW9kdWxlJyxcbiAgICAgICAgICAgICAgICAnSHR0cE1vZHVsZScsXG4gICAgICAgICAgICAgICAgJ1JvdXRlck1vZHVsZSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgbGVuID0gTkcyX01PRFVMRVMubGVuZ3RoO1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGV4dC5pbmRleE9mKE5HMl9NT0RVTEVTW2ldKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcihcImRlYnVnXCIsIGZ1bmN0aW9uKG9wdGlvbmFsVmFsdWUpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkN1cnJlbnQgQ29udGV4dFwiKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIj09PT09PT09PT09PT09PT09PT09XCIpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuXG4gICAgICAgICAgaWYgKG9wdGlvbmFsVmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiT3B0aW9uYWxWYWx1ZVwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiPT09PT09PT09PT09PT09PT09PT1cIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhvcHRpb25hbFZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdicmVha2xpbmVzJywgZnVuY3Rpb24odGV4dCkge1xuICAgICAgICAgICAgdGV4dCA9IEhhbmRsZWJhcnMuVXRpbHMuZXNjYXBlRXhwcmVzc2lvbih0ZXh0KTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccikvZ20sICc8YnI+Jyk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8gL2dtLCAnJm5ic3A7Jyk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cdC9nbSwgJyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOycpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcodGV4dCk7XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdjbGVhbi1wYXJhZ3JhcGgnLCBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC88cD4vZ20sICcnKTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLzxcXC9wPi9nbSwgJycpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcodGV4dCk7XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdlc2NhcGVTaW1wbGVRdW90ZScsIGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgICAgIGlmKCF0ZXh0KSByZXR1cm47XG4gICAgICAgICAgICB2YXIgX3RleHQgPSB0ZXh0LnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKTtcbiAgICAgICAgICAgIF90ZXh0ID0gX3RleHQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKS9nbSwgJycpO1xuICAgICAgICAgICAgcmV0dXJuIF90ZXh0O1xuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignYnJlYWtDb21tYScsIGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgICAgIHRleHQgPSBIYW5kbGViYXJzLlV0aWxzLmVzY2FwZUV4cHJlc3Npb24odGV4dCk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8sL2csICcsPGJyPicpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcodGV4dCk7XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdtb2RpZktpbmQnLCBmdW5jdGlvbihraW5kKSB7XG4gICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvYmxvYi83M2VlMmZlYjUxYzliN2UyNGEyOWViNGNlZTE5ZDdjMTRiOTMzMDY1L2xpYi90eXBlc2NyaXB0LmQudHMjTDY0XG4gICAgICAgICAgICBsZXQgX2tpbmRUZXh0ID0gJyc7XG4gICAgICAgICAgICBzd2l0Y2goa2luZCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMTEyOlxuICAgICAgICAgICAgICAgICAgICBfa2luZFRleHQgPSAnUHJpdmF0ZSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTEzOlxuICAgICAgICAgICAgICAgICAgICBfa2luZFRleHQgPSAnUHJvdGVjdGVkJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxMTQ6XG4gICAgICAgICAgICAgICAgICAgIF9raW5kVGV4dCA9ICdQdWJsaWMnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDExNTpcbiAgICAgICAgICAgICAgICAgICAgX2tpbmRUZXh0ID0gJ1N0YXRpYyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcoX2tpbmRUZXh0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ21vZGlmSWNvbicsIGZ1bmN0aW9uKGtpbmQpIHtcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9ibG9iLzczZWUyZmViNTFjOWI3ZTI0YTI5ZWI0Y2VlMTlkN2MxNGI5MzMwNjUvbGliL3R5cGVzY3JpcHQuZC50cyNMNjRcbiAgICAgICAgICAgIGxldCBfa2luZFRleHQgPSAnJztcbiAgICAgICAgICAgIHN3aXRjaChraW5kKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAxMTI6XG4gICAgICAgICAgICAgICAgICAgIF9raW5kVGV4dCA9ICdsb2NrJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxMTM6XG4gICAgICAgICAgICAgICAgICAgIF9raW5kVGV4dCA9ICdjaXJjbGUnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDExNTpcbiAgICAgICAgICAgICAgICAgICAgX2tpbmRUZXh0ID0gJ3NxdWFyZSc7XG4gICAgICAgICAgICAgICAgY2FzZSA4MzpcbiAgICAgICAgICAgICAgICAgICAgX2tpbmRUZXh0ID0gJ2V4cG9ydCc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9raW5kVGV4dDtcbiAgICAgICAgfSk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb252ZXJ0IHtAbGluayBNeUNsYXNzfSB0byBbTXlDbGFzc10oaHR0cDovL2xvY2FsaG9zdDo4MDgwL2NsYXNzZXMvTXlDbGFzcy5odG1sKVxuICAgICAgICAgKi9cbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcigncGFyc2VEZXNjcmlwdGlvbicsIGZ1bmN0aW9uKGRlc2NyaXB0aW9uLCBkZXB0aCkge1xuICAgICAgICAgICAgbGV0IHRhZ1JlZ0V4cCA9IG5ldyBSZWdFeHAoJ1xcXFx7QGxpbmtcXFxccysoKD86LnxcXG4pKz8pXFxcXH0nLCAnaScpLFxuICAgICAgICAgICAgICAgIG1hdGNoZXMsXG4gICAgICAgICAgICAgICAgcHJldmlvdXNTdHJpbmcsXG4gICAgICAgICAgICAgICAgdGFnSW5mbyA9IFtdXG5cbiAgICAgICAgICAgIHZhciBwcm9jZXNzVGhlTGluayA9IGZ1bmN0aW9uKHN0cmluZywgdGFnSW5mbykge1xuICAgICAgICAgICAgICAgIHZhciBsZWFkaW5nID0gZXh0cmFjdExlYWRpbmdUZXh0KHN0cmluZywgdGFnSW5mby5jb21wbGV0ZVRhZyksXG4gICAgICAgICAgICAgICAgICAgIHNwbGl0LFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgIG5ld0xpbmssXG4gICAgICAgICAgICAgICAgICAgIHJvb3RQYXRoLFxuICAgICAgICAgICAgICAgICAgICBzdHJpbmd0b1JlcGxhY2U7XG5cbiAgICAgICAgICAgICAgICBzcGxpdCA9IHNwbGl0TGlua1RleHQodGFnSW5mby50ZXh0KTtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3BsaXQubGlua1RleHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZmluZEluQ29tcG9kb2Moc3BsaXQudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmZpbmRJbkNvbXBvZG9jKHRhZ0luZm8udGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobGVhZGluZy5sZWFkaW5nVGV4dCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5ndG9SZXBsYWNlID0gJ1snICsgbGVhZGluZy5sZWFkaW5nVGV4dCArICddJyArIHRhZ0luZm8uY29tcGxldGVUYWc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNwbGl0LmxpbmtUZXh0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5ndG9SZXBsYWNlID0gdGFnSW5mby5jb21wbGV0ZVRhZztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZ3RvUmVwbGFjZSA9IHRhZ0luZm8uY29tcGxldGVUYWc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnR5cGUgPT09ICdjbGFzcycpIHJlc3VsdC50eXBlID0gJ2NsYXNzZSc7XG5cbiAgICAgICAgICAgICAgICAgICAgcm9vdFBhdGggPSAnJztcblxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGRlcHRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdFBhdGggPSAnLi8nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RQYXRoID0gJy4uLyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdFBhdGggPSAnLi4vLi4vJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGxldCBsYWJlbCA9IHJlc3VsdC5uYW1lO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGVhZGluZy5sZWFkaW5nVGV4dCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBsZWFkaW5nLmxlYWRpbmdUZXh0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3BsaXQubGlua1RleHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IHNwbGl0LmxpbmtUZXh0O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbmV3TGluayA9IGA8YSBocmVmPVwiJHtyb290UGF0aH0ke3Jlc3VsdC50eXBlfXMvJHtyZXN1bHQubmFtZX0uaHRtbFwiPiR7bGFiZWx9PC9hPmA7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShzdHJpbmd0b1JlcGxhY2UsIG5ld0xpbmspO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiByZXBsYWNlTWF0Y2gocmVwbGFjZXIsIHRhZywgbWF0Y2gsIHRleHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2hlZFRhZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGVUYWc6IG1hdGNoLFxuICAgICAgICAgICAgICAgICAgICB0YWc6IHRhZyxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogdGV4dFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGFnSW5mby5wdXNoKG1hdGNoZWRUYWcpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcGxhY2VyKGRlc2NyaXB0aW9uLCBtYXRjaGVkVGFnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIG1hdGNoZXMgPSB0YWdSZWdFeHAuZXhlYyhkZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNTdHJpbmcgPSBkZXNjcmlwdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSByZXBsYWNlTWF0Y2gocHJvY2Vzc1RoZUxpbmssICdsaW5rJywgbWF0Y2hlc1swXSwgbWF0Y2hlc1sxXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSB3aGlsZSAobWF0Y2hlcyAmJiBwcmV2aW91c1N0cmluZyAhPT0gZGVzY3JpcHRpb24pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb247XG4gICAgICAgIH0pO1xuXG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3JlbGF0aXZlVVJMJywgZnVuY3Rpb24oY3VycmVudERlcHRoLCBjb250ZXh0KSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gJyc7XG5cbiAgICAgICAgICAgIHN3aXRjaCAoY3VycmVudERlcHRoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSAnLi8nO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9ICcuLi8nO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9ICcuLi8uLi8nO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZnVuY3Rpb25TaWduYXR1cmUnLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICAgIGxldCBhcmdzID0gW10sXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbiA9IENvbmZpZ3VyYXRpb24uZ2V0SW5zdGFuY2UoKSxcbiAgICAgICAgICAgICAgICBhbmd1bGFyRG9jUHJlZml4ID0gcHJlZml4T2ZmaWNpYWxEb2MoY29uZmlndXJhdGlvbi5tYWluRGF0YS5hbmd1bGFyVmVyc2lvbik7XG4gICAgICAgICAgICBpZiAobWV0aG9kLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICBhcmdzID0gbWV0aG9kLmFyZ3MubWFwKGZ1bmN0aW9uKGFyZykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgX3Jlc3VsdCA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZmluZChhcmcudHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdC5zb3VyY2UgPT09ICdpbnRlcm5hbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IF9yZXN1bHQuZGF0YS50eXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LmRhdGEudHlwZSA9PT0gJ2NsYXNzJykgcGF0aCA9ICdjbGFzc2UnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmcubmFtZX06IDxhIGhyZWY9XCIuLi8ke3BhdGh9cy8ke19yZXN1bHQuZGF0YS5uYW1lfS5odG1sXCI+JHthcmcudHlwZX08L2E+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBgaHR0cHM6Ly8ke2FuZ3VsYXJEb2NQcmVmaXh9YW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvJHtfcmVzdWx0LmRhdGEucGF0aH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmcubmFtZX06IDxhIGhyZWY9XCIke3BhdGh9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+JHthcmcudHlwZX08L2E+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhcmcuZG90RG90RG90VG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgLi4uJHthcmcubmFtZX06ICR7YXJnLnR5cGV9YDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmcubmFtZX06ICR7YXJnLnR5cGV9YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLmpvaW4oJywgJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobWV0aG9kLm5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7bWV0aG9kLm5hbWV9KCR7YXJnc30pYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAoJHthcmdzfSlgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignanNkb2MtcmV0dXJucy1jb21tZW50JywgZnVuY3Rpb24oanNkb2NUYWdzLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0ganNkb2NUYWdzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUudGV4dCA9PT0gJ3JldHVybnMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBqc2RvY1RhZ3NbaV0uY29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2pzZG9jLWNvbXBvbmVudC1leGFtcGxlJywgZnVuY3Rpb24oanNkb2NUYWdzOmpzZG9jVGFnSW50ZXJmYWNlW10sIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBqc2RvY1RhZ3MubGVuZ3RoLFxuICAgICAgICAgICAgICAgIHRhZ3MgPSBbXTtcblxuICAgICAgICAgICAgbGV0IGNsZWFuVGFnID0gZnVuY3Rpb24oY29tbWVudCkge1xuICAgICAgICAgICAgICAgIGlmIChjb21tZW50LmNoYXJBdCgwKSA9PT0gJyonKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBjb21tZW50LnN1YnN0cmluZygxLCBjb21tZW50Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjb21tZW50LmNoYXJBdCgwKSA9PT0gJyAnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBjb21tZW50LnN1YnN0cmluZygxLCBjb21tZW50Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBjb21tZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgdHlwZSA9ICdodG1sJztcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuaGFzaC50eXBlKSB7XG4gICAgICAgICAgICAgICAgdHlwZSA9IG9wdGlvbnMuaGFzaC50eXBlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBodG1sRW50aXRpZXMoc3RyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZyhzdHIpLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoLz4vZywgJyZndDsnKS5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZS50ZXh0ID09PSAnZXhhbXBsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YWcgPSB7fSBhcyBqc2RvY1RhZ0ludGVyZmFjZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0uY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5jb21tZW50ID0gYDxwcmUgY2xhc3M9XCJsaW5lLW51bWJlcnNcIj48Y29kZSBjbGFzcz1cImxhbmd1YWdlLSR7dHlwZX1cIj5gICsgaHRtbEVudGl0aWVzKGNsZWFuVGFnKGpzZG9jVGFnc1tpXS5jb21tZW50KSkgKyBgPC9jb2RlPjwvcHJlPmA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdzLnB1c2godGFnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0YWdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhZ3MgPSB0YWdzO1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignanNkb2MtZXhhbXBsZScsIGZ1bmN0aW9uKGpzZG9jVGFnczpqc2RvY1RhZ0ludGVyZmFjZVtdLCBvcHRpb25zKSB7XG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0ganNkb2NUYWdzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICB0YWdzID0gW107XG5cbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZS50ZXh0ID09PSAnZXhhbXBsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YWcgPSB7fSBhcyBqc2RvY1RhZ0ludGVyZmFjZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0uY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5jb21tZW50ID0ganNkb2NUYWdzW2ldLmNvbW1lbnQucmVwbGFjZSgvPGNhcHRpb24+L2csICc8Yj48aT4nKS5yZXBsYWNlKC9cXC9jYXB0aW9uPi9nLCAnL2I+PC9pPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGFncy5wdXNoKHRhZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGFncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWdzID0gdGFncztcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2pzZG9jLXBhcmFtcycsIGZ1bmN0aW9uKGpzZG9jVGFnczpqc2RvY1RhZ0ludGVyZmFjZVtdLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0ganNkb2NUYWdzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICB0YWdzID0gW107XG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUudGV4dCA9PT0gJ3BhcmFtJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRhZyA9IHt9IGFzIGpzZG9jVGFnSW50ZXJmYWNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50eXBlRXhwcmVzc2lvbiAmJiBqc2RvY1RhZ3NbaV0udHlwZUV4cHJlc3Npb24udHlwZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnLnR5cGUgPSBqc2RvY1RhZ3NbaV0udHlwZUV4cHJlc3Npb24udHlwZS5uYW1lLnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0uY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5jb21tZW50ID0ganNkb2NUYWdzW2ldLmNvbW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0ubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5uYW1lID0ganNkb2NUYWdzW2ldLm5hbWUudGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ3MucHVzaCh0YWcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRhZ3MubGVuZ3RoID49IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhZ3MgPSB0YWdzO1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignanNkb2MtZGVmYXVsdCcsIGZ1bmN0aW9uKGpzZG9jVGFnczpqc2RvY1RhZ0ludGVyZmFjZVtdLCBvcHRpb25zKSB7XG4gICAgICAgICAgICBpZiAoanNkb2NUYWdzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgICAgICAgICBsZW4gPSBqc2RvY1RhZ3MubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICB0YWcgPSB7fSBhcyBqc2RvY1RhZ0ludGVyZmFjZSxcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUudGV4dCA9PT0gJ2RlZmF1bHQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnR5cGVFeHByZXNzaW9uICYmIGpzZG9jVGFnc1tpXS50eXBlRXhwcmVzc2lvbi50eXBlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnLnR5cGUgPSBqc2RvY1RhZ3NbaV0udHlwZUV4cHJlc3Npb24udHlwZS5uYW1lLnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5jb21tZW50ID0ganNkb2NUYWdzW2ldLmNvbW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5uYW1lID0ganNkb2NUYWdzW2ldLm5hbWUudGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhZyA9IHRhZztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignbGlua1R5cGUnLCBmdW5jdGlvbihuYW1lLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgX3Jlc3VsdCA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZmluZChuYW1lKSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uID0gQ29uZmlndXJhdGlvbi5nZXRJbnN0YW5jZSgpLFxuICAgICAgICAgICAgICAgIGFuZ3VsYXJEb2NQcmVmaXggPSBwcmVmaXhPZmZpY2lhbERvYyhjb25maWd1cmF0aW9uLm1haW5EYXRhLmFuZ3VsYXJWZXJzaW9uKTtcbiAgICAgICAgICAgIGlmIChfcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy50eXBlID0ge1xuICAgICAgICAgICAgICAgICAgICByYXc6IG5hbWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKF9yZXN1bHQuc291cmNlID09PSAnaW50ZXJuYWwnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LmRhdGEudHlwZSA9PT0gJ2NsYXNzJykgX3Jlc3VsdC5kYXRhLnR5cGUgPSAnY2xhc3NlJztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLmhyZWYgPSAnLi4vJyArIF9yZXN1bHQuZGF0YS50eXBlICsgJ3MvJyArIF9yZXN1bHQuZGF0YS5uYW1lICsgJy5odG1sJztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLnRhcmdldCA9ICdfc2VsZic7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLmhyZWYgPSBgaHR0cHM6Ly8ke2FuZ3VsYXJEb2NQcmVmaXh9YW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvJHtfcmVzdWx0LmRhdGEucGF0aH1gO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGUudGFyZ2V0ID0gJ19ibGFuayc7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdpbmRleGFibGVTaWduYXR1cmUnLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBtZXRob2QuYXJncy5tYXAoYXJnID0+IGAke2FyZy5uYW1lfTogJHthcmcudHlwZX1gKS5qb2luKCcsICcpO1xuICAgICAgICAgICAgaWYgKG1ldGhvZC5uYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke21ldGhvZC5uYW1lfVske2FyZ3N9XWA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBgWyR7YXJnc31dYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ29iamVjdCcsIGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgICAgIHRleHQgPSBKU09OLnN0cmluZ2lmeSh0ZXh0KTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoL3tcIi8sICd7PGJyPiZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1wiJyk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8sXCIvLCAnLDxicj4mbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDtcIicpO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvfSQvLCAnPGJyPn0nKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgSGFuZGxlYmFycy5TYWZlU3RyaW5nKHRleHQpO1xuICAgICAgICB9KTtcblxuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdpc05vdFRvZ2dsZScsIGZ1bmN0aW9uKHR5cGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGxldCBjb25maWd1cmF0aW9uID0gQ29uZmlndXJhdGlvbi5nZXRJbnN0YW5jZSgpLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudG9nZ2xlTWVudUl0ZW1zLmluZGV4T2YodHlwZSk7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5tYWluRGF0YS50b2dnbGVNZW51SXRlbXMuaW5kZXhPZignYWxsJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzdWx0ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5pdDogaW5pdFxuICAgIH1cbn0pKClcbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBIYW5kbGViYXJzIGZyb20gJ2hhbmRsZWJhcnMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vLi4vbG9nZ2VyJztcbi8vaW1wb3J0ICogYXMgaGVscGVycyBmcm9tICdoYW5kbGViYXJzLWhlbHBlcnMnO1xuaW1wb3J0IHsgSHRtbEVuZ2luZUhlbHBlcnMgfSBmcm9tICcuL2h0bWwuZW5naW5lLmhlbHBlcnMnO1xuXG5leHBvcnQgY2xhc3MgSHRtbEVuZ2luZSB7XG4gICAgY2FjaGU6IE9iamVjdCA9IHt9O1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBIdG1sRW5naW5lSGVscGVycy5pbml0KCk7XG4gICAgfVxuICAgIGluaXQoKSB7XG4gICAgICAgIGxldCBwYXJ0aWFscyA9IFtcbiAgICAgICAgICAgICdtZW51JyxcbiAgICAgICAgICAgICdvdmVydmlldycsXG4gICAgICAgICAgICAnbWFya2Rvd24nLFxuICAgICAgICAgICAgJ21vZHVsZXMnLFxuICAgICAgICAgICAgJ21vZHVsZScsXG4gICAgICAgICAgICAnY29tcG9uZW50cycsXG4gICAgICAgICAgICAnY29tcG9uZW50JyxcbiAgICAgICAgICAgICdjb21wb25lbnQtZGV0YWlsJyxcbiAgICAgICAgICAgICdkaXJlY3RpdmVzJyxcbiAgICAgICAgICAgICdkaXJlY3RpdmUnLFxuICAgICAgICAgICAgJ2luamVjdGFibGVzJyxcbiAgICAgICAgICAgICdpbmplY3RhYmxlJyxcbiAgICAgICAgICAgICdwaXBlcycsXG4gICAgICAgICAgICAncGlwZScsXG4gICAgICAgICAgICAnY2xhc3NlcycsXG4gICAgICAgICAgICAnY2xhc3MnLFxuXHQgICAgICAgICdpbnRlcmZhY2UnLFxuICAgICAgICAgICAgJ3JvdXRlcycsXG4gICAgICAgICAgICAnc2VhcmNoLXJlc3VsdHMnLFxuICAgICAgICAgICAgJ3NlYXJjaC1pbnB1dCcsXG4gICAgICAgICAgICAnbGluay10eXBlJyxcbiAgICAgICAgICAgICdibG9jay1tZXRob2QnLFxuICAgICAgICAgICAgJ2Jsb2NrLWVudW0nLFxuICAgICAgICAgICAgJ2Jsb2NrLXByb3BlcnR5JyxcbiAgICAgICAgICAgICdibG9jay1pbmRleCcsXG4gICAgICAgICAgICAnYmxvY2stY29uc3RydWN0b3InLFxuICAgICAgICAgICAgJ2NvdmVyYWdlLXJlcG9ydCcsXG4gICAgICAgICAgICAnbWlzY2VsbGFuZW91cycsXG4gICAgICAgICAgICAnYWRkaXRpb25hbC1wYWdlJ1xuICAgICAgICBdLFxuICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSBwYXJ0aWFscy5sZW5ndGgsXG4gICAgICAgICAgICBsb29wID0gKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKCBpIDw9IGxlbi0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy90ZW1wbGF0ZXMvcGFydGlhbHMvJyArIHBhcnRpYWxzW2ldICsgJy5oYnMnKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7IHJlamVjdCgpOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbChwYXJ0aWFsc1tpXSwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb29wKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy90ZW1wbGF0ZXMvcGFnZS5oYnMnKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgnRXJyb3IgZHVyaW5nIGluZGV4IGdlbmVyYXRpb24nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FjaGVbJ3BhZ2UnXSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBsb29wKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZW5kZXIobWFpbkRhdGE6YW55LCBwYWdlOmFueSkge1xuICAgICAgICB2YXIgbyA9IG1haW5EYXRhLFxuICAgICAgICAgICAgdGhhdCA9IHRoaXM7XG4gICAgICAgICg8YW55Pk9iamVjdCkuYXNzaWduKG8sIHBhZ2UpO1xuICAgICAgICBsZXQgdGVtcGxhdGU6YW55ID0gSGFuZGxlYmFycy5jb21waWxlKHRoYXQuY2FjaGVbJ3BhZ2UnXSksXG4gICAgICAgICAgICByZXN1bHQgPSB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICAgICAgZGF0YTogb1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGdlbmVyYXRlQ292ZXJhZ2VCYWRnZShvdXRwdXRGb2xkZXIsIGNvdmVyYWdlRGF0YSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgZnMucmVhZEZpbGUocGF0aC5yZXNvbHZlKF9fZGlybmFtZSArICcvLi4vc3JjL3RlbXBsYXRlcy9wYXJ0aWFscy9jb3ZlcmFnZS1iYWRnZS5oYnMnKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgY292ZXJhZ2UgYmFkZ2UgZ2VuZXJhdGlvbicpO1xuICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICBsZXQgdGVtcGxhdGU6YW55ID0gSGFuZGxlYmFycy5jb21waWxlKGRhdGEpLFxuICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjb3ZlcmFnZURhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgb3V0cHV0Rm9sZGVyID0gb3V0cHV0Rm9sZGVyLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpO1xuICAgICAgICAgICAgICAgICAgIGZzLm91dHB1dEZpbGUocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIG91dHB1dEZvbGRlciArIHBhdGguc2VwICsgJy9pbWFnZXMvY292ZXJhZ2UtYmFkZ2Uuc3ZnJyksIHJlc3VsdCwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICBpZihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nIGNvdmVyYWdlIGJhZGdlIGZpbGUgZ2VuZXJhdGlvbiAnLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSk7XG4gICAgICAgfSk7XG4gICAgfVxufTtcbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmNvbnN0IG1hcmtlZCA9IHJlcXVpcmUoJ21hcmtlZCcpO1xuXG5leHBvcnQgY2xhc3MgTWFya2Rvd25FbmdpbmUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCByZW5kZXJlciA9IG5ldyBtYXJrZWQuUmVuZGVyZXIoKTtcbiAgICAgICAgcmVuZGVyZXIuY29kZSA9IChjb2RlLCBsYW5ndWFnZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGhpZ2hsaWdodGVkID0gY29kZTtcbiAgICAgICAgICAgIGlmICghbGFuZ3VhZ2UpIHtcbiAgICAgICAgICAgICAgICBsYW5ndWFnZSA9ICdub25lJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQgPSB0aGlzLmVzY2FwZShjb2RlKTtcbiAgICAgICAgICAgIHJldHVybiBgPHByZSBjbGFzcz1cImxpbmUtbnVtYmVyc1wiPjxjb2RlIGNsYXNzPVwibGFuZ3VhZ2UtJHtsYW5ndWFnZX1cIj4ke2hpZ2hsaWdodGVkfTwvY29kZT48L3ByZT5gO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJlbmRlcmVyLnRhYmxlID0gKGhlYWRlciwgYm9keSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICc8dGFibGUgY2xhc3M9XCJ0YWJsZSB0YWJsZS1ib3JkZXJlZCBjb21wb2RvYy10YWJsZVwiPlxcbidcbiAgICAgICAgICAgICAgICArICc8dGhlYWQ+XFxuJ1xuICAgICAgICAgICAgICAgICsgaGVhZGVyXG4gICAgICAgICAgICAgICAgKyAnPC90aGVhZD5cXG4nXG4gICAgICAgICAgICAgICAgKyAnPHRib2R5PlxcbidcbiAgICAgICAgICAgICAgICArIGJvZHlcbiAgICAgICAgICAgICAgICArICc8L3Rib2R5PlxcbidcbiAgICAgICAgICAgICAgICArICc8L3RhYmxlPlxcbic7XG4gICAgICAgIH1cblxuICAgICAgICByZW5kZXJlci5pbWFnZSA9IGZ1bmN0aW9uIChocmVmLCB0aXRsZSwgdGV4dCkge1xuICAgICAgICAgICAgdmFyIG91dCA9ICc8aW1nIHNyYz1cIicgKyBocmVmICsgJ1wiIGFsdD1cIicgKyB0ZXh0ICsgJ1wiIGNsYXNzPVwiaW1nLXJlc3BvbnNpdmVcIic7XG4gICAgICAgICAgICBpZiAodGl0bGUpIHtcbiAgICAgICAgICAgICAgICBvdXQgKz0gJyB0aXRsZT1cIicgKyB0aXRsZSArICdcIic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXQgKz0gdGhpcy5vcHRpb25zLnhodG1sID8gJy8+JyA6ICc+JztcbiAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgbWFya2VkLnNldE9wdGlvbnMoe1xuICAgICAgICAgICAgcmVuZGVyZXI6IHJlbmRlcmVyLFxuICAgICAgICAgICAgYnJlYWtzOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0KGZpbGVwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyBmaWxlcGF0aCksICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgJyArIGZpbGVwYXRoICsgJyByZWFkJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShtYXJrZWQoZGF0YSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0VHJhZGl0aW9uYWxNYXJrZG93bihmaWxlcGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgZmlsZXBhdGggKyAnLm1kJyksICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgZnMucmVhZEZpbGUocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIGZpbGVwYXRoKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgJyArIGZpbGVwYXRoICsgJyByZWFkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobWFya2VkKGRhdGEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShtYXJrZWQoZGF0YSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0UmVhZG1lRmlsZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyAnUkVBRE1FLm1kJyksICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgUkVBRE1FLm1kIGZpbGUgcmVhZGluZycpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobWFya2VkKGRhdGEpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNvbXBvbmVudEhhc1JlYWRtZUZpbGUoZmlsZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBkaXJuYW1lID0gcGF0aC5kaXJuYW1lKGZpbGUpLFxuICAgICAgICAgICAgcmVhZG1lRmlsZSA9IGRpcm5hbWUgKyBwYXRoLnNlcCArICdSRUFETUUubWQnLFxuICAgICAgICAgICAgcmVhZG1lQWx0ZXJuYXRpdmVGaWxlID0gZGlybmFtZSArIHBhdGguc2VwICsgcGF0aC5iYXNlbmFtZShmaWxlLCAnLnRzJykgKyAnLm1kJztcbiAgICAgICAgcmV0dXJuIGZzLmV4aXN0c1N5bmMocmVhZG1lRmlsZSkgfHwgZnMuZXhpc3RzU3luYyhyZWFkbWVBbHRlcm5hdGl2ZUZpbGUpO1xuICAgIH1cbiAgICBjb21wb25lbnRSZWFkbWVGaWxlKGZpbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGxldCBkaXJuYW1lID0gcGF0aC5kaXJuYW1lKGZpbGUpLFxuICAgICAgICAgICAgcmVhZG1lRmlsZSA9IGRpcm5hbWUgKyBwYXRoLnNlcCArICdSRUFETUUubWQnLFxuICAgICAgICAgICAgcmVhZG1lQWx0ZXJuYXRpdmVGaWxlID0gZGlybmFtZSArIHBhdGguc2VwICsgcGF0aC5iYXNlbmFtZShmaWxlLCAnLnRzJykgKyAnLm1kJyxcbiAgICAgICAgICAgIGZpbmFsUGF0aCA9ICcnO1xuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhyZWFkbWVGaWxlKSkge1xuICAgICAgICAgICAgZmluYWxQYXRoID0gcmVhZG1lRmlsZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpbmFsUGF0aCA9IHJlYWRtZUFsdGVybmF0aXZlRmlsZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmluYWxQYXRoO1xuICAgIH1cbiAgICBoYXNSb290TWFya2Rvd25zKCk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgcmVhZG1lRmlsZSA9IHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArICdSRUFETUUubWQnLFxuICAgICAgICAgICAgcmVhZG1lRmlsZVdpdGhvdXRFeHRlbnNpb24gPSBwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyAnUkVBRE1FJyxcbiAgICAgICAgICAgIGNoYW5nZWxvZ0ZpbGUgPSBwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyAnQ0hBTkdFTE9HLm1kJyxcbiAgICAgICAgICAgIGNoYW5nZWxvZ0ZpbGVXaXRob3V0RXh0ZW5zaW9uID0gcHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgJ0NIQU5HRUxPRycsXG4gICAgICAgICAgICBsaWNlbnNlRmlsZSA9IHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArICdMSUNFTlNFLm1kJyxcbiAgICAgICAgICAgIGxpY2Vuc2VGaWxlV2l0aG91dEV4dGVuc2lvbiA9IHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArICdMSUNFTlNFJyxcbiAgICAgICAgICAgIGNvbnRyaWJ1dGluZ0ZpbGUgPSBwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyAnQ09OVFJJQlVUSU5HLm1kJyxcbiAgICAgICAgICAgIGNvbnRyaWJ1dGluZ0ZpbGVXaXRob3V0RXh0ZW5zaW9uID0gcHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgJ0NPTlRSSUJVVElORycsXG4gICAgICAgICAgICB0b2RvRmlsZSA9IHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArICdUT0RPLm1kJyxcbiAgICAgICAgICAgIHRvZG9GaWxlV2l0aG91dEV4dGVuc2lvbiA9IHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArICdUT0RPJztcbiAgICAgICAgcmV0dXJuIGZzLmV4aXN0c1N5bmMocmVhZG1lRmlsZSkgfHxcbiAgICAgICAgICAgICAgIGZzLmV4aXN0c1N5bmMocmVhZG1lRmlsZVdpdGhvdXRFeHRlbnNpb24pIHx8XG4gICAgICAgICAgICAgICBmcy5leGlzdHNTeW5jKGNoYW5nZWxvZ0ZpbGUpIHx8XG4gICAgICAgICAgICAgICBmcy5leGlzdHNTeW5jKGNoYW5nZWxvZ0ZpbGVXaXRob3V0RXh0ZW5zaW9uKSB8fFxuICAgICAgICAgICAgICAgZnMuZXhpc3RzU3luYyhsaWNlbnNlRmlsZSkgfHxcbiAgICAgICAgICAgICAgIGZzLmV4aXN0c1N5bmMobGljZW5zZUZpbGVXaXRob3V0RXh0ZW5zaW9uKSB8fFxuICAgICAgICAgICAgICAgZnMuZXhpc3RzU3luYyhjb250cmlidXRpbmdGaWxlKSB8fFxuICAgICAgICAgICAgICAgZnMuZXhpc3RzU3luYyhjb250cmlidXRpbmdGaWxlV2l0aG91dEV4dGVuc2lvbikgfHxcbiAgICAgICAgICAgICAgIGZzLmV4aXN0c1N5bmModG9kb0ZpbGUpIHx8XG4gICAgICAgICAgICAgICBmcy5leGlzdHNTeW5jKHRvZG9GaWxlV2l0aG91dEV4dGVuc2lvbik7XG4gICAgfVxuICAgIGxpc3RSb290TWFya2Rvd25zKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgbGV0IGxpc3QgPSBbXSxcbiAgICAgICAgICAgIHJlYWRtZSA9ICdSRUFETUUnLFxuICAgICAgICAgICAgY2hhbmdlbG9nID0gJ0NIQU5HRUxPRycsXG4gICAgICAgICAgICBjb250cmlidXRpbmcgPSAnQ09OVFJJQlVUSU5HJyxcbiAgICAgICAgICAgIGxpY2Vuc2UgPSAnTElDRU5TRScsXG4gICAgICAgICAgICB0b2RvID0gJ1RPRE8nO1xuICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgcmVhZG1lICsgJy5tZCcpIHx8IGZzLmV4aXN0c1N5bmMocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgcmVhZG1lKSkge1xuICAgICAgICAgICAgICAgIC8vbGlzdC5wdXNoKHJlYWRtZSk7XG4gICAgICAgICAgICAgICAgbGlzdC5wdXNoKHJlYWRtZSsgJy5tZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgY2hhbmdlbG9nICsgJy5tZCcpIHx8IGZzLmV4aXN0c1N5bmMocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgY2hhbmdlbG9nKSkge1xuICAgICAgICAgICAgICAgIGxpc3QucHVzaChjaGFuZ2Vsb2cpO1xuICAgICAgICAgICAgICAgIGxpc3QucHVzaChjaGFuZ2Vsb2crICcubWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIGNvbnRyaWJ1dGluZyArICcubWQnKSB8fCBmcy5leGlzdHNTeW5jKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIGNvbnRyaWJ1dGluZykpIHtcbiAgICAgICAgICAgICAgICBsaXN0LnB1c2goY29udHJpYnV0aW5nKTtcbiAgICAgICAgICAgICAgICBsaXN0LnB1c2goY29udHJpYnV0aW5nKyAnLm1kJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyBsaWNlbnNlICsgJy5tZCcpIHx8IGZzLmV4aXN0c1N5bmMocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgbGljZW5zZSkpIHtcbiAgICAgICAgICAgICAgICBsaXN0LnB1c2gobGljZW5zZSk7XG4gICAgICAgICAgICAgICAgbGlzdC5wdXNoKGxpY2Vuc2UrICcubWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIHRvZG8gKyAnLm1kJykgfHwgZnMuZXhpc3RzU3luYyhwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyB0b2RvKSkge1xuICAgICAgICAgICAgICAgIGxpc3QucHVzaCh0b2RvKTtcbiAgICAgICAgICAgICAgICBsaXN0LnB1c2godG9kbysgJy5tZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGlzdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGVzY2FwZShodG1sKSB7XG4gICAgICAgIHJldHVybiBodG1sXG4gICAgICAgICAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgJyYjMzk7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9AL2csICcmIzY0OycpO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgSGFuZGxlYmFycyBmcm9tICdoYW5kbGViYXJzJztcblxuZXhwb3J0IGNsYXNzIEZpbGVFbmdpbmUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgfVxuICAgIGdldChmaWxlcGF0aDpzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgZmlsZXBhdGgpLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyAnICsgZmlsZXBhdGggKyAnIHJlYWQnKTtcbiAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgU2hlbGxqcyBmcm9tICdzaGVsbGpzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5cbmltcG9ydCB7ICRkZXBlbmRlbmNpZXNFbmdpbmUgfSBmcm9tICcuL2RlcGVuZGVuY2llcy5lbmdpbmUnO1xuXG5pbXBvcnQgaXNHbG9iYWwgZnJvbSAnLi4vLi4vdXRpbHMvZ2xvYmFsLnBhdGgnO1xuXG5jb25zdCBuZ2RDciA9IHJlcXVpcmUoJ0Bjb21wb2RvYy9uZ2QtY29yZScpLFxuICAgICAgbmdkVCA9IHJlcXVpcmUoJ0Bjb21wb2RvYy9uZ2QtdHJhbnNmb3JtZXInKSxcbiAgICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxuZXhwb3J0IGNsYXNzIE5nZEVuZ2luZSB7XG4gICAgY29uc3RydWN0b3IoKSB7fVxuICAgIHJlbmRlckdyYXBoKGZpbGVwYXRoOiBzdHJpbmcsIG91dHB1dHBhdGg6IHN0cmluZywgdHlwZTogc3RyaW5nLCBuYW1lPzogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIG5nZENyLmxvZ2dlci5zaWxlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgIGxldCBlbmdpbmUgPSBuZXcgbmdkVC5Eb3RFbmdpbmUoe1xuICAgICAgICAgICAgICAgIG91dHB1dDogb3V0cHV0cGF0aCxcbiAgICAgICAgICAgICAgICBkaXNwbGF5TGVnZW5kOiB0cnVlLFxuICAgICAgICAgICAgICAgIG91dHB1dEZvcm1hdHM6ICdzdmcnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnZicpIHtcbiAgICAgICAgICAgICAgICBlbmdpbmVcbiAgICAgICAgICAgICAgICAgICAgLmdlbmVyYXRlR3JhcGgoWyRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0UmF3TW9kdWxlKG5hbWUpXSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZmlsZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbmdpbmVcbiAgICAgICAgICAgICAgICAgICAgLmdlbmVyYXRlR3JhcGgoJGRlcGVuZGVuY2llc0VuZ2luZS5yYXdNb2R1bGVzRm9yT3ZlcnZpZXcpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZpbGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LCBlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlYWRHcmFwaChmaWxlcGF0aDogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgZnMucmVhZEZpbGUocGF0aC5yZXNvbHZlKGZpbGVwYXRoKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgZ3JhcGggcmVhZCAnICsgbmFtZSk7XG4gICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIEhhbmRsZWJhcnMgZnJvbSAnaGFuZGxlYmFycyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi8uLi9sb2dnZXInO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uL2NvbmZpZ3VyYXRpb24nO1xuXG5jb25zdCBsdW5yOiBhbnkgPSByZXF1aXJlKCdsdW5yJyksXG4gICAgICBjaGVlcmlvOiBhbnkgPSByZXF1aXJlKCdjaGVlcmlvJyksXG4gICAgICBFbnRpdGllczphbnkgPSByZXF1aXJlKCdodG1sLWVudGl0aWVzJykuQWxsSHRtbEVudGl0aWVzLFxuICAgICAgJGNvbmZpZ3VyYXRpb24gPSBDb25maWd1cmF0aW9uLmdldEluc3RhbmNlKCksXG4gICAgICBIdG1sID0gbmV3IEVudGl0aWVzKCk7XG5cbmV4cG9ydCBjbGFzcyBTZWFyY2hFbmdpbmUge1xuICAgIHNlYXJjaEluZGV4OiBhbnk7XG4gICAgZG9jdW1lbnRzU3RvcmU6IE9iamVjdCA9IHt9O1xuICAgIGluZGV4U2l6ZTogbnVtYmVyO1xuICAgIGNvbnN0cnVjdG9yKCkge31cbiAgICBwcml2YXRlIGdldFNlYXJjaEluZGV4KCkge1xuICAgICAgICBpZiAoIXRoaXMuc2VhcmNoSW5kZXgpIHtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoSW5kZXggPSBsdW5yKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZigndXJsJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5maWVsZCgndGl0bGUnLCB7IGJvb3N0OiAxMCB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpZWxkKCdib2R5Jyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5zZWFyY2hJbmRleDtcbiAgICB9XG4gICAgaW5kZXhQYWdlKHBhZ2UpIHtcbiAgICAgICAgdmFyIHRleHQsXG4gICAgICAgICAgICAkID0gY2hlZXJpby5sb2FkKHBhZ2UucmF3RGF0YSk7XG5cbiAgICAgICAgdGV4dCA9ICQoJy5jb250ZW50JykuaHRtbCgpO1xuICAgICAgICB0ZXh0ID0gSHRtbC5kZWNvZGUodGV4dCk7XG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyg8KFtePl0rKT4pL2lnLCAnJyk7XG5cbiAgICAgICAgcGFnZS51cmwgPSBwYWdlLnVybC5yZXBsYWNlKCRjb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCwgJycpO1xuXG4gICAgICAgIHZhciBkb2MgPSB7XG4gICAgICAgICAgICB1cmw6IHBhZ2UudXJsLFxuICAgICAgICAgICAgdGl0bGU6IHBhZ2UuaW5mb3MuY29udGV4dCArICcgLSAnICsgcGFnZS5pbmZvcy5uYW1lLFxuICAgICAgICAgICAgYm9keTogdGV4dFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICghdGhpcy5kb2N1bWVudHNTdG9yZS5oYXNPd25Qcm9wZXJ0eShkb2MudXJsKSkge1xuICAgICAgICAgICAgdGhpcy5kb2N1bWVudHNTdG9yZVtkb2MudXJsXSA9IGRvYztcbiAgICAgICAgICAgIHRoaXMuZ2V0U2VhcmNoSW5kZXgoKS5hZGQoZG9jKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZW5lcmF0ZVNlYXJjaEluZGV4SnNvbihvdXRwdXRGb2xkZXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy90ZW1wbGF0ZXMvcGFydGlhbHMvc2VhcmNoLWluZGV4LmhicycpLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyBzZWFyY2ggaW5kZXggZ2VuZXJhdGlvbicpO1xuICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICBsZXQgdGVtcGxhdGU6YW55ID0gSGFuZGxlYmFycy5jb21waWxlKGRhdGEpLFxuICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogSlNPTi5zdHJpbmdpZnkodGhpcy5nZXRTZWFyY2hJbmRleCgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlOiBKU09OLnN0cmluZ2lmeSh0aGlzLmRvY3VtZW50c1N0b3JlKVxuICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICBvdXRwdXRGb2xkZXIgPSBvdXRwdXRGb2xkZXIucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgZnMub3V0cHV0RmlsZShwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgb3V0cHV0Rm9sZGVyICsgcGF0aC5zZXAgKyAnL2pzL3NlYXJjaC9zZWFyY2hfaW5kZXguanMnKSwgcmVzdWx0LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgc2VhcmNoIGluZGV4IGZpbGUgZ2VuZXJhdGlvbiAnLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSk7XG4gICAgICAgfSk7XG4gICAgfVxufTtcbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJ3V0aWwnO1xuXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuL2xvZ2dlcic7XG5cbmNvbnN0IGNhcnJpYWdlUmV0dXJuTGluZUZlZWQgPSAnXFxyXFxuJyxcbiAgICAgIGxpbmVGZWVkID0gJ1xcbicsXG4gICAgICB0cyA9IHJlcXVpcmUoJ3R5cGVzY3JpcHQnKSxcbiAgICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuTmFtZVdpdGhvdXRTcGFjZUFuZFRvTG93ZXJDYXNlKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8gL2csICctJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXRlY3RJbmRlbnQoc3RyLCBjb3VudCwgaW5kZW50Pyk6IHN0cmluZyB7XG4gICAgbGV0IHN0cmlwSW5kZW50ID0gZnVuY3Rpb24oc3RyOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBzdHIubWF0Y2goL15bIFxcdF0qKD89XFxTKS9nbSk7XG5cbiAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IHVzZSBzcHJlYWQgb3BlcmF0b3Igd2hlbiB0YXJnZXRpbmcgTm9kZS5qcyA2XG4gICAgICAgIGNvbnN0IGluZGVudCA9IE1hdGgubWluLmFwcGx5KE1hdGgsIG1hdGNoLm1hcCh4ID0+IHgubGVuZ3RoKSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKGBeWyBcXFxcdF17JHtpbmRlbnR9fWAsICdnbScpO1xuXG4gICAgICAgIHJldHVybiBpbmRlbnQgPiAwID8gc3RyLnJlcGxhY2UocmUsICcnKSA6IHN0cjtcbiAgICB9LFxuICAgICAgICByZXBlYXRpbmcgPSBmdW5jdGlvbihuLCBzdHIpIHtcbiAgICAgICAgc3RyID0gc3RyID09PSB1bmRlZmluZWQgPyAnICcgOiBzdHI7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBpbnB1dFxcYCB0byBiZSBhIFxcYHN0cmluZ1xcYCwgZ290IFxcYCR7dHlwZW9mIHN0cn1cXGBgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuIDwgMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgY291bnRcXGAgdG8gYmUgYSBwb3NpdGl2ZSBmaW5pdGUgbnVtYmVyLCBnb3QgXFxgJHtufVxcYGApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJldCA9ICcnO1xuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGlmIChuICYgMSkge1xuICAgICAgICAgICAgICAgIHJldCArPSBzdHI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN0ciArPSBzdHI7XG4gICAgICAgIH0gd2hpbGUgKChuID4+PSAxKSk7XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9LFxuICAgIGluZGVudFN0cmluZyA9IGZ1bmN0aW9uKHN0ciwgY291bnQsIGluZGVudCkge1xuICAgICAgICBpbmRlbnQgPSBpbmRlbnQgPT09IHVuZGVmaW5lZCA/ICcgJyA6IGluZGVudDtcbiAgICAgICAgY291bnQgPSBjb3VudCA9PT0gdW5kZWZpbmVkID8gMSA6IGNvdW50O1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgaW5wdXRcXGAgdG8gYmUgYSBcXGBzdHJpbmdcXGAsIGdvdCBcXGAke3R5cGVvZiBzdHJ9XFxgYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGNvdW50ICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgY291bnRcXGAgdG8gYmUgYSBcXGBudW1iZXJcXGAsIGdvdCBcXGAke3R5cGVvZiBjb3VudH1cXGBgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgaW5kZW50ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgaW5kZW50XFxgIHRvIGJlIGEgXFxgc3RyaW5nXFxgLCBnb3QgXFxgJHt0eXBlb2YgaW5kZW50fVxcYGApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5kZW50ID0gY291bnQgPiAxID8gcmVwZWF0aW5nKGNvdW50LCBpbmRlbnQpIDogaW5kZW50O1xuXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvXig/IVxccyokKS9tZywgaW5kZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5kZW50U3RyaW5nKHN0cmlwSW5kZW50KHN0ciksIGNvdW50IHx8IDAsIGluZGVudCk7XG59XG5cbi8vIENyZWF0ZSBhIGNvbXBpbGVySG9zdCBvYmplY3QgdG8gYWxsb3cgdGhlIGNvbXBpbGVyIHRvIHJlYWQgYW5kIHdyaXRlIGZpbGVzXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZXJIb3N0KHRyYW5zcGlsZU9wdGlvbnM6IGFueSk6IHRzLkNvbXBpbGVySG9zdCB7XG5cbiAgICBjb25zdCBpbnB1dEZpbGVOYW1lID0gdHJhbnNwaWxlT3B0aW9ucy5maWxlTmFtZSB8fCAodHJhbnNwaWxlT3B0aW9ucy5qc3ggPyAnbW9kdWxlLnRzeCcgOiAnbW9kdWxlLnRzJyk7XG5cbiAgICBjb25zdCBjb21waWxlckhvc3Q6IHRzLkNvbXBpbGVySG9zdCA9IHtcbiAgICAgICAgZ2V0U291cmNlRmlsZTogKGZpbGVOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmlsZU5hbWUubGFzdEluZGV4T2YoJy50cycpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGlmIChmaWxlTmFtZSA9PT0gJ2xpYi5kLnRzJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZmlsZU5hbWUuc3Vic3RyKC01KSA9PT0gJy5kLnRzJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwYXRoLmlzQWJzb2x1dGUoZmlsZU5hbWUpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSA9IHBhdGguam9pbih0cmFuc3BpbGVPcHRpb25zLnRzY29uZmlnRGlyZWN0b3J5LCBmaWxlTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhmaWxlTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgbGliU291cmNlID0gJyc7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBsaWJTb3VyY2UgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZU5hbWUpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKGUsIGZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHMuY3JlYXRlU291cmNlRmlsZShmaWxlTmFtZSwgbGliU291cmNlLCB0cmFuc3BpbGVPcHRpb25zLnRhcmdldCwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGVGaWxlOiAobmFtZSwgdGV4dCkgPT4ge30sXG4gICAgICAgIGdldERlZmF1bHRMaWJGaWxlTmFtZTogKCkgPT4gJ2xpYi5kLnRzJyxcbiAgICAgICAgdXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lczogKCkgPT4gZmFsc2UsXG4gICAgICAgIGdldENhbm9uaWNhbEZpbGVOYW1lOiBmaWxlTmFtZSA9PiBmaWxlTmFtZSxcbiAgICAgICAgZ2V0Q3VycmVudERpcmVjdG9yeTogKCkgPT4gJycsXG4gICAgICAgIGdldE5ld0xpbmU6ICgpID0+ICdcXG4nLFxuICAgICAgICBmaWxlRXhpc3RzOiAoZmlsZU5hbWUpOiBib29sZWFuID0+IGZpbGVOYW1lID09PSBpbnB1dEZpbGVOYW1lLFxuICAgICAgICByZWFkRmlsZTogKCkgPT4gJycsXG4gICAgICAgIGRpcmVjdG9yeUV4aXN0czogKCkgPT4gdHJ1ZSxcbiAgICAgICAgZ2V0RGlyZWN0b3JpZXM6ICgpID0+IFtdXG4gICAgfTtcbiAgICByZXR1cm4gY29tcGlsZXJIb3N0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZE1haW5Tb3VyY2VGb2xkZXIoZmlsZXM6IHN0cmluZ1tdKSB7XG4gICAgbGV0IG1haW5Gb2xkZXIgPSAnJyxcbiAgICAgICAgbWFpbkZvbGRlckNvdW50ID0gMCxcbiAgICAgICAgcmF3Rm9sZGVycyA9IGZpbGVzLm1hcCgoZmlsZXBhdGgpID0+IHtcbiAgICAgICAgICAgIHZhciBzaG9ydFBhdGggPSBmaWxlcGF0aC5yZXBsYWNlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCwgJycpO1xuICAgICAgICAgICAgcmV0dXJuIHBhdGguZGlybmFtZShzaG9ydFBhdGgpO1xuICAgICAgICB9KSxcbiAgICAgICAgZm9sZGVycyA9IHt9LFxuICAgICAgICBpID0gMDtcbiAgICByYXdGb2xkZXJzID0gXy51bmlxKHJhd0ZvbGRlcnMpO1xuICAgIGxldCBsZW4gPSByYXdGb2xkZXJzLmxlbmd0aDtcbiAgICBmb3IoaTsgaTxsZW47IGkrKyl7XG4gICAgICAgIGxldCBzZXAgPSByYXdGb2xkZXJzW2ldLnNwbGl0KHBhdGguc2VwKTtcbiAgICAgICAgc2VwLm1hcCgoZm9sZGVyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZm9sZGVyc1tmb2xkZXJdKSB7XG4gICAgICAgICAgICAgICAgZm9sZGVyc1tmb2xkZXJdICs9IDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvbGRlcnNbZm9sZGVyXSA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuICAgIGZvciAobGV0IGYgaW4gZm9sZGVycykge1xuICAgICAgICBpZihmb2xkZXJzW2ZdID4gbWFpbkZvbGRlckNvdW50KSB7XG4gICAgICAgICAgICBtYWluRm9sZGVyQ291bnQgPSBmb2xkZXJzW2ZdO1xuICAgICAgICAgICAgbWFpbkZvbGRlciA9IGY7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1haW5Gb2xkZXI7XG59XG4iLCJpbXBvcnQgKiBhcyB1dGlsIGZyb20gJ3V0aWwnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIEhhbmRsZWJhcnMgZnJvbSAnaGFuZGxlYmFycyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi9sb2dnZXInO1xuXG5jb25zdCBKU09ONSA9IHJlcXVpcmUoJ2pzb241JyksXG4gICAgICBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbmV4cG9ydCBsZXQgUm91dGVyUGFyc2VyID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHJvdXRlczogYW55W10gPSBbXSxcbiAgICAgICAgaW5jb21wbGV0ZVJvdXRlcyA9IFtdLFxuICAgICAgICBtb2R1bGVzID0gW10sXG4gICAgICAgIG1vZHVsZXNUcmVlLFxuICAgICAgICByb290TW9kdWxlLFxuICAgICAgICBjbGVhbk1vZHVsZXNUcmVlLFxuICAgICAgICBtb2R1bGVzV2l0aFJvdXRlcyA9IFtdLFxuXG4gICAgICAgIF9hZGRSb3V0ZSA9IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgICAgICAgICByb3V0ZXMucHVzaChyb3V0ZSk7XG4gICAgICAgICAgICByb3V0ZXMgPSBfLnNvcnRCeShfLnVuaXFXaXRoKHJvdXRlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9hZGRJbmNvbXBsZXRlUm91dGUgPSBmdW5jdGlvbihyb3V0ZSkge1xuICAgICAgICAgICAgaW5jb21wbGV0ZVJvdXRlcy5wdXNoKHJvdXRlKTtcbiAgICAgICAgICAgIGluY29tcGxldGVSb3V0ZXMgPSBfLnNvcnRCeShfLnVuaXFXaXRoKGluY29tcGxldGVSb3V0ZXMsIF8uaXNFcXVhbCksIFsnbmFtZSddKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYWRkTW9kdWxlV2l0aFJvdXRlcyA9IGZ1bmN0aW9uKG1vZHVsZU5hbWUsIG1vZHVsZUltcG9ydHMsIGZpbGVuYW1lKSB7XG4gICAgICAgICAgICBtb2R1bGVzV2l0aFJvdXRlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBtb2R1bGVOYW1lLFxuICAgICAgICAgICAgICAgIGltcG9ydHNOb2RlOiBtb2R1bGVJbXBvcnRzLFxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBmaWxlbmFtZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtb2R1bGVzV2l0aFJvdXRlcyA9IF8uc29ydEJ5KF8udW5pcVdpdGgobW9kdWxlc1dpdGhSb3V0ZXMsIF8uaXNFcXVhbCksIFsnbmFtZSddKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYWRkTW9kdWxlID0gZnVuY3Rpb24obW9kdWxlTmFtZTogc3RyaW5nLCBtb2R1bGVJbXBvcnRzKSB7XG4gICAgICAgICAgICBtb2R1bGVzLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IG1vZHVsZU5hbWUsXG4gICAgICAgICAgICAgICAgaW1wb3J0c05vZGU6IG1vZHVsZUltcG9ydHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbW9kdWxlcyA9IF8uc29ydEJ5KF8udW5pcVdpdGgobW9kdWxlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9jbGVhblJhd1JvdXRlUGFyc2VkID0gZnVuY3Rpb24ocm91dGU6IHN0cmluZykge1xuICAgICAgICAgICAgbGV0IHJvdXRlc1dpdGhvdXRTcGFjZXMgPSByb3V0ZS5yZXBsYWNlKC8gL2dtLCAnJyksXG4gICAgICAgICAgICAgICAgdGVzdFRyYWlsaW5nQ29tbWEgPSByb3V0ZXNXaXRob3V0U3BhY2VzLmluZGV4T2YoJ30sXScpO1xuICAgICAgICAgICAgaWYgKHRlc3RUcmFpbGluZ0NvbW1hICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgcm91dGVzV2l0aG91dFNwYWNlcyA9IHJvdXRlc1dpdGhvdXRTcGFjZXMucmVwbGFjZSgnfSxdJywgJ31dJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gSlNPTjUucGFyc2Uocm91dGVzV2l0aG91dFNwYWNlcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2NsZWFuUmF3Um91dGUgPSBmdW5jdGlvbihyb3V0ZTogc3RyaW5nKSB7XG4gICAgICAgICAgICBsZXQgcm91dGVzV2l0aG91dFNwYWNlcyA9IHJvdXRlLnJlcGxhY2UoLyAvZ20sICcnKSxcbiAgICAgICAgICAgICAgICB0ZXN0VHJhaWxpbmdDb21tYSA9IHJvdXRlc1dpdGhvdXRTcGFjZXMuaW5kZXhPZignfSxdJyk7XG4gICAgICAgICAgICBpZiAodGVzdFRyYWlsaW5nQ29tbWEgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICByb3V0ZXNXaXRob3V0U3BhY2VzID0gcm91dGVzV2l0aG91dFNwYWNlcy5yZXBsYWNlKCd9LF0nLCAnfV0nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByb3V0ZXNXaXRob3V0U3BhY2VzO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9zZXRSb290TW9kdWxlID0gZnVuY3Rpb24obW9kdWxlOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIHJvb3RNb2R1bGUgPSBtb2R1bGU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2hhc1JvdXRlck1vZHVsZUluSW1wb3J0cyA9IGZ1bmN0aW9uKGltcG9ydHMpIHtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBpbXBvcnRzLmxlbmd0aDtcbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGltcG9ydHNbaV0ubmFtZS5pbmRleE9mKCdSb3V0ZXJNb2R1bGUuZm9yQ2hpbGQnKSAhPT0gLTEgfHxcbiAgICAgICAgICAgICAgICAgICAgaW1wb3J0c1tpXS5uYW1lLmluZGV4T2YoJ1JvdXRlck1vZHVsZS5mb3JSb290JykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcblxuICAgICAgICBfZml4SW5jb21wbGV0ZVJvdXRlcyA9IGZ1bmN0aW9uKG1pc2NlbGxhbmVvdXNWYXJpYWJsZXMpIHtcbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJ2ZpeEluY29tcGxldGVSb3V0ZXMnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJvdXRlcyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7Ki9cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2cobWlzY2VsbGFuZW91c1ZhcmlhYmxlcyk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBpbmNvbXBsZXRlUm91dGVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBtYXRjaGluZ1ZhcmlhYmxlcyA9IFtdO1xuICAgICAgICAgICAgLy8gRm9yIGVhY2ggaW5jb21wbGV0ZVJvdXRlLCBzY2FuIGlmIG9uZSBtaXNjIHZhcmlhYmxlIGlzIGluIGNvZGVcbiAgICAgICAgICAgIC8vIGlmIG9rLCB0cnkgcmVjcmVhdGluZyBjb21wbGV0ZSByb3V0ZVxuICAgICAgICAgICAgZm9yIChpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGogPSAwLFxuICAgICAgICAgICAgICAgICAgICBsZW5nID0gbWlzY2VsbGFuZW91c1ZhcmlhYmxlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgZm9yIChqOyBqPGxlbmc7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5jb21wbGV0ZVJvdXRlc1tpXS5kYXRhLmluZGV4T2YobWlzY2VsbGFuZW91c1ZhcmlhYmxlc1tqXS5uYW1lKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmb3VuZCBvbmUgbWlzYyB2YXIgaW5zaWRlIGluY29tcGxldGVSb3V0ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cobWlzY2VsbGFuZW91c1ZhcmlhYmxlc1tqXS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoaW5nVmFyaWFibGVzLnB1c2gobWlzY2VsbGFuZW91c1ZhcmlhYmxlc1tqXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9DbGVhbiBpbmNvbXBsZXRlUm91dGVcbiAgICAgICAgICAgICAgICBpbmNvbXBsZXRlUm91dGVzW2ldLmRhdGEgPSBpbmNvbXBsZXRlUm91dGVzW2ldLmRhdGEucmVwbGFjZSgnWycsICcnKTtcbiAgICAgICAgICAgICAgICBpbmNvbXBsZXRlUm91dGVzW2ldLmRhdGEgPSBpbmNvbXBsZXRlUm91dGVzW2ldLmRhdGEucmVwbGFjZSgnXScsICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coaW5jb21wbGV0ZVJvdXRlcyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtYXRjaGluZ1ZhcmlhYmxlcyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7Ki9cblxuICAgICAgICB9LFxuXG4gICAgICAgIF9saW5rTW9kdWxlc0FuZFJvdXRlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLypjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbGlua01vZHVsZXNBbmRSb3V0ZXM6ICcpO1xuICAgICAgICAgICAgLy9zY2FuIGVhY2ggbW9kdWxlIGltcG9ydHMgQVNUIGZvciBlYWNoIHJvdXRlcywgYW5kIGxpbmsgcm91dGVzIHdpdGggbW9kdWxlXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbGlua01vZHVsZXNBbmRSb3V0ZXMgcm91dGVzOiAnLCByb3V0ZXMpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpOyovXG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gbW9kdWxlc1dpdGhSb3V0ZXMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2gobW9kdWxlc1dpdGhSb3V0ZXNbaV0uaW1wb3J0c05vZGUsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaW5pdGlhbGl6ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmluaXRpYWxpemVyLmVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMsIGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9maW5kIGVsZW1lbnQgd2l0aCBhcmd1bWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuYXJndW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2goZWxlbWVudC5hcmd1bWVudHMsIGZ1bmN0aW9uKGFyZ3VtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKHJvdXRlcywgZnVuY3Rpb24ocm91dGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoYXJndW1lbnQudGV4dCAmJiByb3V0ZS5uYW1lID09PSBhcmd1bWVudC50ZXh0ICYmIHJvdXRlLmZpbGVuYW1lID09PSBtb2R1bGVzV2l0aFJvdXRlc1tpXS5maWxlbmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGUubW9kdWxlID0gbW9kdWxlc1dpdGhSb3V0ZXNbaV0ubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKmNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlbmQgbGlua01vZHVsZXNBbmRSb3V0ZXM6ICcpO1xuICAgICAgICAgICAgY29uc29sZS5sb2codXRpbC5pbnNwZWN0KHJvdXRlcywgeyBkZXB0aDogMTAgfSkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpOyovXG4gICAgICAgIH0sXG5cbiAgICAgICAgZm91bmRSb3V0ZVdpdGhNb2R1bGVOYW1lID0gZnVuY3Rpb24obW9kdWxlTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIF8uZmluZChyb3V0ZXMsIHsnbW9kdWxlJzogbW9kdWxlTmFtZX0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZvdW5kTGF6eU1vZHVsZVdpdGhQYXRoID0gZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgLy9wYXRoIGlzIGxpa2UgYXBwL2N1c3RvbWVycy9jdXN0b21lcnMubW9kdWxlI0N1c3RvbWVyc01vZHVsZVxuICAgICAgICAgICAgbGV0IHNwbGl0ID0gcGF0aC5zcGxpdCgnIycpLFxuICAgICAgICAgICAgICAgIGxhenlNb2R1bGVQYXRoID0gc3BsaXRbMF0sXG4gICAgICAgICAgICAgICAgbGF6eU1vZHVsZU5hbWUgPSBzcGxpdFsxXTtcbiAgICAgICAgICAgIHJldHVybiBsYXp5TW9kdWxlTmFtZTtcbiAgICAgICAgfSxcblxuICAgICAgICBfY29uc3RydWN0Um91dGVzVHJlZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICAvKmNvbnNvbGUubG9nKCdjb25zdHJ1Y3RSb3V0ZXNUcmVlIG1vZHVsZXM6ICcsIG1vZHVsZXMpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2NvbnN0cnVjdFJvdXRlc1RyZWUgbW9kdWxlc1dpdGhSb3V0ZXM6ICcsIG1vZHVsZXNXaXRoUm91dGVzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjb25zdHJ1Y3RSb3V0ZXNUcmVlIG1vZHVsZXNUcmVlOiAnLCB1dGlsLmluc3BlY3QobW9kdWxlc1RyZWUsIHsgZGVwdGg6IDEwIH0pKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTsqL1xuXG4gICAgICAgICAgICAvLyByb3V0ZXNbXSBjb250YWlucyByb3V0ZXMgd2l0aCBtb2R1bGUgbGlua1xuICAgICAgICAgICAgLy8gbW9kdWxlc1RyZWUgY29udGFpbnMgbW9kdWxlcyB0cmVlXG4gICAgICAgICAgICAvLyBtYWtlIGEgZmluYWwgcm91dGVzIHRyZWUgd2l0aCB0aGF0XG4gICAgICAgICAgICBjbGVhbk1vZHVsZXNUcmVlID0gXy5jbG9uZURlZXAobW9kdWxlc1RyZWUpO1xuXG4gICAgICAgICAgICBsZXQgbW9kdWxlc0NsZWFuZXIgPSBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIGFycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFycltpXS5pbXBvcnRzTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhcnJbaV0uaW1wb3J0c05vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJyW2ldLnBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhcnJbaV0ucGFyZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoYXJyW2ldLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlc0NsZWFuZXIoYXJyW2ldLmNoaWxkcmVuKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbW9kdWxlc0NsZWFuZXIoY2xlYW5Nb2R1bGVzVHJlZSk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJyAgY2xlYW5Nb2R1bGVzVHJlZSBsaWdodDogJywgdXRpbC5pbnNwZWN0KGNsZWFuTW9kdWxlc1RyZWUsIHsgZGVwdGg6IDEwIH0pKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJycpO1xuXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKHJvdXRlcyk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcnKTtcblxuICAgICAgICAgICAgdmFyIHJvdXRlc1RyZWUgPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogJzxyb290PicsXG4gICAgICAgICAgICAgICAga2luZDogJ21vZHVsZScsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiByb290TW9kdWxlLFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbGV0IGxvb3BNb2R1bGVzUGFyc2VyID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmNoaWxkcmVuICYmIG5vZGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvL0lmIG1vZHVsZSBoYXMgY2hpbGQgbW9kdWxlc1xuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcgICBJZiBtb2R1bGUgaGFzIGNoaWxkIG1vZHVsZXMnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByb3V0ZSA9IGZvdW5kUm91dGVXaXRoTW9kdWxlTmFtZShub2RlLmNoaWxkcmVuW2ldLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvdXRlICYmIHJvdXRlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZS5jaGlsZHJlbiA9IEpTT041LnBhcnNlKHJvdXRlLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSByb3V0ZS5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLmtpbmQgPSAnbW9kdWxlJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXNUcmVlLmNoaWxkcmVuLnB1c2gocm91dGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW5baV0uY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wTW9kdWxlc1BhcnNlcihub2RlLmNoaWxkcmVuW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vZWxzZSByb3V0ZXMgYXJlIGRpcmVjdGx5IGluc2lkZSB0aGUgbW9kdWxlXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJyAgIGVsc2Ugcm91dGVzIGFyZSBkaXJlY3RseSBpbnNpZGUgdGhlIHJvb3QgbW9kdWxlJyk7XG4gICAgICAgICAgICAgICAgICAgIGxldCByYXdSb3V0ZXMgPSBmb3VuZFJvdXRlV2l0aE1vZHVsZU5hbWUobm9kZS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJhd1JvdXRlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJvdXRlcyA9IEpTT041LnBhcnNlKHJhd1JvdXRlcy5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb3V0ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbiA9IHJvdXRlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJvdXRlID0gcm91dGVzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocm91dGVzW2ldLmNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVzVHJlZS5jaGlsZHJlbi5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kOiAnY29tcG9uZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IHJvdXRlc1tpXS5jb21wb25lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogcm91dGVzW2ldLnBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcgIHJvb3RNb2R1bGU6ICcsIHJvb3RNb2R1bGUpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnJyk7XG5cbiAgICAgICAgICAgIGxldCBzdGFydE1vZHVsZSA9IF8uZmluZChjbGVhbk1vZHVsZXNUcmVlLCB7J25hbWUnOiByb290TW9kdWxlfSk7XG5cbiAgICAgICAgICAgIGlmIChzdGFydE1vZHVsZSkge1xuICAgICAgICAgICAgICAgIGxvb3BNb2R1bGVzUGFyc2VyKHN0YXJ0TW9kdWxlKTtcbiAgICAgICAgICAgICAgICAvL0xvb3AgdHdpY2UgZm9yIHJvdXRlcyB3aXRoIGxhenkgbG9hZGluZ1xuICAgICAgICAgICAgICAgIC8vbG9vcE1vZHVsZXNQYXJzZXIocm91dGVzVHJlZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJyAgcm91dGVzVHJlZTogJywgcm91dGVzVHJlZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7Ki9cblxuICAgICAgICAgICAgdmFyIGNsZWFuZWRSb3V0ZXNUcmVlID0gbnVsbDtcblxuICAgICAgICAgICAgdmFyIGNsZWFuUm91dGVzVHJlZSA9IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIHJvdXRlLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByb3V0ZXMgPSByb3V0ZS5jaGlsZHJlbltpXS5yb3V0ZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByb3V0ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xlYW5lZFJvdXRlc1RyZWUgPSBjbGVhblJvdXRlc1RyZWUocm91dGVzVHJlZSk7XG5cbiAgICAgICAgICAgIC8vVHJ5IHVwZGF0aW5nIHJvdXRlcyB3aXRoIGxhenkgbG9hZGluZ1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdUcnkgdXBkYXRpbmcgcm91dGVzIHdpdGggbGF6eSBsb2FkaW5nJyk7XG5cbiAgICAgICAgICAgIGxldCBsb29wUm91dGVzUGFyc2VyID0gZnVuY3Rpb24ocm91dGUpIHtcbiAgICAgICAgICAgICAgICBpZihyb3V0ZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gcm91dGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb3V0ZS5jaGlsZHJlbltpXS5sb2FkQ2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSBmb3VuZExhenlNb2R1bGVXaXRoUGF0aChyb3V0ZS5jaGlsZHJlbltpXS5sb2FkQ2hpbGRyZW4pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGUgPSBfLmZpbmQoY2xlYW5Nb2R1bGVzVHJlZSwgeyduYW1lJzogY2hpbGR9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9kdWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBfcmF3TW9kdWxlOmFueSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmF3TW9kdWxlLmtpbmQgPSAnbW9kdWxlJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3Jhd01vZHVsZS5jaGlsZHJlbiA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmF3TW9kdWxlLm1vZHVsZSA9IG1vZHVsZS5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbG9vcEluc2lkZSA9IGZ1bmN0aW9uKG1vZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYobW9kLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIG1vZC5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcm91dGUgPSBmb3VuZFJvdXRlV2l0aE1vZHVsZU5hbWUobW9kLmNoaWxkcmVuW2ldLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJvdXRlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvdXRlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZS5jaGlsZHJlbiA9IEpTT041LnBhcnNlKHJvdXRlLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSByb3V0ZS5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLmtpbmQgPSAnbW9kdWxlJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmF3TW9kdWxlLmNoaWxkcmVuW2ldID0gcm91dGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcEluc2lkZShtb2R1bGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLmNoaWxkcmVuW2ldLmNoaWxkcmVuID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLmNoaWxkcmVuW2ldLmNoaWxkcmVuLnB1c2goX3Jhd01vZHVsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbG9vcFJvdXRlc1BhcnNlcihyb3V0ZS5jaGlsZHJlbltpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb29wUm91dGVzUGFyc2VyKGNsZWFuZWRSb3V0ZXNUcmVlKTtcblxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcgIGNsZWFuZWRSb3V0ZXNUcmVlOiAnLCB1dGlsLmluc3BlY3QoY2xlYW5lZFJvdXRlc1RyZWUsIHsgZGVwdGg6IDEwIH0pKTtcblxuICAgICAgICAgICAgcmV0dXJuIGNsZWFuZWRSb3V0ZXNUcmVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9jb25zdHJ1Y3RNb2R1bGVzVHJlZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdjb25zdHJ1Y3RNb2R1bGVzVHJlZScpO1xuICAgICAgICAgICAgbGV0IGdldE5lc3RlZENoaWxkcmVuID0gZnVuY3Rpb24oYXJyLCBwYXJlbnQ/KSB7XG4gICAgICAgICAgICAgICAgdmFyIG91dCA9IFtdXG4gICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIGFycikge1xuICAgICAgICAgICAgICAgICAgICBpZihhcnJbaV0ucGFyZW50ID09PSBwYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IGdldE5lc3RlZENoaWxkcmVuKGFyciwgYXJyW2ldLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihjaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJbaV0uY2hpbGRyZW4gPSBjaGlsZHJlblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0LnB1c2goYXJyW2ldKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL1NjYW4gZWFjaCBtb2R1bGUgYW5kIGFkZCBwYXJlbnQgcHJvcGVydHlcbiAgICAgICAgICAgIF8uZm9yRWFjaChtb2R1bGVzLCBmdW5jdGlvbihmaXJzdExvb3BNb2R1bGUpIHtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2goZmlyc3RMb29wTW9kdWxlLmltcG9ydHNOb2RlLCBmdW5jdGlvbihpbXBvcnROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChtb2R1bGVzLCBmdW5jdGlvbihtb2R1bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBtb2R1bGUubmFtZSA9PT0gaW1wb3J0Tm9kZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlLnBhcmVudCA9IGZpcnN0TG9vcE1vZHVsZS5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtb2R1bGVzVHJlZSA9IGdldE5lc3RlZENoaWxkcmVuKG1vZHVsZXMpO1xuICAgICAgICAgICAgLypjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZW5kIGNvbnN0cnVjdE1vZHVsZXNUcmVlJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtb2R1bGVzVHJlZSk7Ki9cbiAgICAgICAgfSxcblxuICAgICAgICBfZ2VuZXJhdGVSb3V0ZXNJbmRleCA9IGZ1bmN0aW9uKG91dHB1dEZvbGRlciwgcm91dGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy90ZW1wbGF0ZXMvcGFydGlhbHMvcm91dGVzLWluZGV4LmhicycpLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgnRXJyb3IgZHVyaW5nIHJvdXRlcyBpbmRleCBnZW5lcmF0aW9uJyk7XG4gICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXBsYXRlOmFueSA9IEhhbmRsZWJhcnMuY29tcGlsZShkYXRhKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRlbXBsYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXM6IEpTT04uc3RyaW5naWZ5KHJvdXRlcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRGb2xkZXIgPSBvdXRwdXRGb2xkZXIucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgIGZzLm91dHB1dEZpbGUocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIG91dHB1dEZvbGRlciArIHBhdGguc2VwICsgJy9qcy9yb3V0ZXMvcm91dGVzX2luZGV4LmpzJyksIHJlc3VsdCwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgcm91dGVzIGluZGV4IGZpbGUgZ2VuZXJhdGlvbiAnLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICB9KTtcbiAgICAgICB9LFxuXG4gICAgICAgX3JvdXRlc0xlbmd0aCA9IGZ1bmN0aW9uKCk6IG51bWJlciB7XG4gICAgICAgICAgIHZhciBfbiA9IDA7XG5cbiAgICAgICAgICAgbGV0IHJvdXRlc1BhcnNlciA9IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgICAgICAgICAgICBpZiAodHlwZW9mIHJvdXRlLnBhdGggIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgX24gKz0gMTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIGlmIChyb3V0ZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaiBpbiByb3V0ZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXNQYXJzZXIocm91dGUuY2hpbGRyZW5bal0pO1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfTtcblxuICAgICAgICAgICBmb3IodmFyIGkgaW4gcm91dGVzKSB7XG4gICAgICAgICAgICAgICByb3V0ZXNQYXJzZXIocm91dGVzW2ldKTtcbiAgICAgICAgICAgfVxuXG4gICAgICAgICAgIHJldHVybiBfbjtcbiAgICAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBpbmNvbXBsZXRlUm91dGVzOiBpbmNvbXBsZXRlUm91dGVzLFxuICAgICAgICBhZGRSb3V0ZTogX2FkZFJvdXRlLFxuICAgICAgICBhZGRJbmNvbXBsZXRlUm91dGU6IF9hZGRJbmNvbXBsZXRlUm91dGUsXG4gICAgICAgIGFkZE1vZHVsZVdpdGhSb3V0ZXM6IF9hZGRNb2R1bGVXaXRoUm91dGVzLFxuICAgICAgICBhZGRNb2R1bGU6IF9hZGRNb2R1bGUsXG4gICAgICAgIGNsZWFuUmF3Um91dGVQYXJzZWQ6IF9jbGVhblJhd1JvdXRlUGFyc2VkLFxuICAgICAgICBjbGVhblJhd1JvdXRlOiBfY2xlYW5SYXdSb3V0ZSxcbiAgICAgICAgc2V0Um9vdE1vZHVsZTogX3NldFJvb3RNb2R1bGUsXG4gICAgICAgIHByaW50Um91dGVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwcmludFJvdXRlczogJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyb3V0ZXMpO1xuICAgICAgICB9LFxuICAgICAgICBwcmludE1vZHVsZXNSb3V0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3ByaW50TW9kdWxlc1JvdXRlczogJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtb2R1bGVzV2l0aFJvdXRlcyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJvdXRlc0xlbmd0aDogX3JvdXRlc0xlbmd0aCxcbiAgICAgICAgaGFzUm91dGVyTW9kdWxlSW5JbXBvcnRzOiBfaGFzUm91dGVyTW9kdWxlSW5JbXBvcnRzLFxuICAgICAgICBmaXhJbmNvbXBsZXRlUm91dGVzOiBfZml4SW5jb21wbGV0ZVJvdXRlcyxcbiAgICAgICAgbGlua01vZHVsZXNBbmRSb3V0ZXM6IF9saW5rTW9kdWxlc0FuZFJvdXRlcyxcbiAgICAgICAgY29uc3RydWN0Um91dGVzVHJlZTogX2NvbnN0cnVjdFJvdXRlc1RyZWUsXG4gICAgICAgIGNvbnN0cnVjdE1vZHVsZXNUcmVlOiBfY29uc3RydWN0TW9kdWxlc1RyZWUsXG4gICAgICAgIGdlbmVyYXRlUm91dGVzSW5kZXg6IF9nZW5lcmF0ZVJvdXRlc0luZGV4XG4gICAgfVxufSkoKTtcbiIsImNvbnN0IHRzID0gcmVxdWlyZSgndHlwZXNjcmlwdCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNWYXJpYWJsZUxpa2Uobm9kZTogTm9kZSk6IG5vZGUgaXMgVmFyaWFibGVMaWtlRGVjbGFyYXRpb24ge1xuICAgaWYgKG5vZGUpIHtcbiAgICAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQmluZGluZ0VsZW1lbnQ6XG4gICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FbnVtTWVtYmVyOlxuICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUGFyYW1ldGVyOlxuICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHJvcGVydHlBc3NpZ25tZW50OlxuICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHJvcGVydHlEZWNsYXJhdGlvbjpcbiAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByb3BlcnR5U2lnbmF0dXJlOlxuICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU2hvcnRoYW5kUHJvcGVydHlBc3NpZ25tZW50OlxuICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVmFyaWFibGVEZWNsYXJhdGlvbjpcbiAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgIH1cbiAgIH1cbiAgIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvbWU8VD4oYXJyYXk6IFRbXSwgcHJlZGljYXRlPzogKHZhbHVlOiBUKSA9PiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgaWYgKGFycmF5KSB7XG4gICAgICAgIGlmIChwcmVkaWNhdGUpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdiBvZiBhcnJheSkge1xuICAgICAgICAgICAgICAgIGlmIChwcmVkaWNhdGUodikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5Lmxlbmd0aCA+IDA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uY2F0ZW5hdGU8VD4oYXJyYXkxOiBUW10sIGFycmF5MjogVFtdKTogVFtdIHtcbiAgICBpZiAoIXNvbWUoYXJyYXkyKSkgcmV0dXJuIGFycmF5MTtcbiAgICBpZiAoIXNvbWUoYXJyYXkxKSkgcmV0dXJuIGFycmF5MjtcbiAgICByZXR1cm4gWy4uLmFycmF5MSwgLi4uYXJyYXkyXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGFyYW1ldGVyKG5vZGU6IE5vZGUpOiBub2RlIGlzIFBhcmFtZXRlckRlY2xhcmF0aW9uIHtcbiAgICByZXR1cm4gbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlBhcmFtZXRlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEpTRG9jUGFyYW1ldGVyVGFncyhwYXJhbTogTm9kZSk6IEpTRG9jUGFyYW1ldGVyVGFnW10ge1xuICAgIGlmICghaXNQYXJhbWV0ZXIocGFyYW0pKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbnN0IGZ1bmMgPSBwYXJhbS5wYXJlbnQgYXMgRnVuY3Rpb25MaWtlRGVjbGFyYXRpb247XG4gICAgY29uc3QgdGFncyA9IGdldEpTRG9jVGFncyhmdW5jLCB0cy5TeW50YXhLaW5kLkpTRG9jUGFyYW1ldGVyVGFnKSBhcyBKU0RvY1BhcmFtZXRlclRhZ1tdO1xuICAgIGlmICghcGFyYW0ubmFtZSkge1xuICAgICAgICAvLyB0aGlzIGlzIGFuIGFub255bW91cyBqc2RvYyBwYXJhbSBmcm9tIGEgYGZ1bmN0aW9uKHR5cGUxLCB0eXBlMik6IHR5cGUzYCBzcGVjaWZpY2F0aW9uXG4gICAgICAgIGNvbnN0IGkgPSBmdW5jLnBhcmFtZXRlcnMuaW5kZXhPZihwYXJhbSk7XG4gICAgICAgIGNvbnN0IHBhcmFtVGFncyA9IGZpbHRlcih0YWdzLCB0YWcgPT4gdGFnLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSlNEb2NQYXJhbWV0ZXJUYWcpO1xuICAgICAgICBpZiAocGFyYW1UYWdzICYmIDAgPD0gaSAmJiBpIDwgcGFyYW1UYWdzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIFtwYXJhbVRhZ3NbaV1dO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHBhcmFtLm5hbWUua2luZCA9PT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSAocGFyYW0ubmFtZSBhcyBJZGVudGlmaWVyKS50ZXh0O1xuICAgICAgICByZXR1cm4gZmlsdGVyKHRhZ3MsIHRhZyA9PiB0YWcua2luZCA9PT0gdHMuU3ludGF4S2luZC5KU0RvY1BhcmFtZXRlclRhZyAmJiB0YWcucGFyYW1ldGVyTmFtZS50ZXh0ID09PSBuYW1lKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIFRPRE86IGl0J3MgYSBkZXN0cnVjdHVyZWQgcGFyYW1ldGVyLCBzbyBpdCBzaG91bGQgbG9vayB1cCBhbiBcIm9iamVjdCB0eXBlXCIgc2VyaWVzIG9mIG11bHRpcGxlIGxpbmVzXG4gICAgICAgIC8vIEJ1dCBtdWx0aS1saW5lIG9iamVjdCB0eXBlcyBhcmVuJ3Qgc3VwcG9ydGVkIHlldCBlaXRoZXJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbmV4cG9ydCBsZXQgSlNEb2NUYWdzUGFyc2VyID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgbGV0IF9nZXRKU0RvY3MgPSAobm9kZTogTm9kZSk6KEpTRG9jIHwgSlNEb2NUYWcpW10gPT4ge1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdnZXRKU0RvY3M6ICcsIG5vZGUpO1xuICAgICAgICBsZXQgY2FjaGU6IChKU0RvYyB8IEpTRG9jVGFnKVtdID0gbm9kZS5qc0RvY0NhY2hlO1xuICAgICAgICBpZiAoIWNhY2hlKSB7XG4gICAgICAgICAgICBnZXRKU0RvY3NXb3JrZXIobm9kZSk7XG4gICAgICAgICAgICBub2RlLmpzRG9jQ2FjaGUgPSBjYWNoZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FjaGU7XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0SlNEb2NzV29ya2VyKG5vZGU6IE5vZGUpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50O1xuICAgICAgICAgICAgLy8gVHJ5IHRvIHJlY29nbml6ZSB0aGlzIHBhdHRlcm4gd2hlbiBub2RlIGlzIGluaXRpYWxpemVyIG9mIHZhcmlhYmxlIGRlY2xhcmF0aW9uIGFuZCBKU0RvYyBjb21tZW50cyBhcmUgb24gY29udGFpbmluZyB2YXJpYWJsZSBzdGF0ZW1lbnQuXG4gICAgICAgICAgICAvLyAvKipcbiAgICAgICAgICAgIC8vICAgKiBAcGFyYW0ge251bWJlcn0gbmFtZVxuICAgICAgICAgICAgLy8gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICAgICAgICAvLyAgICovXG4gICAgICAgICAgICAvLyB2YXIgeCA9IGZ1bmN0aW9uKG5hbWUpIHsgcmV0dXJuIG5hbWUubGVuZ3RoOyB9XG4gICAgICAgICAgICBjb25zdCBpc0luaXRpYWxpemVyT2ZWYXJpYWJsZURlY2xhcmF0aW9uSW5TdGF0ZW1lbnQgPVxuICAgICAgICAgICAgICAgIGlzVmFyaWFibGVMaWtlKHBhcmVudCkgJiZcbiAgICAgICAgICAgICAgICBwYXJlbnQuaW5pdGlhbGl6ZXIgPT09IG5vZGUgJiZcbiAgICAgICAgICAgICAgICBwYXJlbnQucGFyZW50LnBhcmVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlU3RhdGVtZW50O1xuICAgICAgICAgICAgY29uc3QgaXNWYXJpYWJsZU9mVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCA9IGlzVmFyaWFibGVMaWtlKG5vZGUpICYmXG4gICAgICAgICAgICAgICAgcGFyZW50LnBhcmVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlU3RhdGVtZW50O1xuICAgICAgICAgICAgY29uc3QgdmFyaWFibGVTdGF0ZW1lbnROb2RlID1cbiAgICAgICAgICAgICAgICBpc0luaXRpYWxpemVyT2ZWYXJpYWJsZURlY2xhcmF0aW9uSW5TdGF0ZW1lbnQgPyBwYXJlbnQucGFyZW50LnBhcmVudCA6XG4gICAgICAgICAgICAgICAgaXNWYXJpYWJsZU9mVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCA/IHBhcmVudC5wYXJlbnQgOlxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICh2YXJpYWJsZVN0YXRlbWVudE5vZGUpIHtcbiAgICAgICAgICAgICAgICBnZXRKU0RvY3NXb3JrZXIodmFyaWFibGVTdGF0ZW1lbnROb2RlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWxzbyByZWNvZ25pemUgd2hlbiB0aGUgbm9kZSBpcyB0aGUgUkhTIG9mIGFuIGFzc2lnbm1lbnQgZXhwcmVzc2lvblxuICAgICAgICAgICAgY29uc3QgaXNTb3VyY2VPZkFzc2lnbm1lbnRFeHByZXNzaW9uU3RhdGVtZW50ID1cbiAgICAgICAgICAgICAgICBwYXJlbnQgJiYgcGFyZW50LnBhcmVudCAmJlxuICAgICAgICAgICAgICAgIHBhcmVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkJpbmFyeUV4cHJlc3Npb24gJiZcbiAgICAgICAgICAgICAgICAocGFyZW50IGFzIEJpbmFyeUV4cHJlc3Npb24pLm9wZXJhdG9yVG9rZW4ua2luZCA9PT0gdHMuU3ludGF4S2luZC5FcXVhbHNUb2tlbiAmJlxuICAgICAgICAgICAgICAgIHBhcmVudC5wYXJlbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5FeHByZXNzaW9uU3RhdGVtZW50O1xuICAgICAgICAgICAgaWYgKGlzU291cmNlT2ZBc3NpZ25tZW50RXhwcmVzc2lvblN0YXRlbWVudCkge1xuICAgICAgICAgICAgICAgIGdldEpTRG9jc1dvcmtlcihwYXJlbnQucGFyZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgaXNNb2R1bGVEZWNsYXJhdGlvbiA9IG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5Nb2R1bGVEZWNsYXJhdGlvbiAmJlxuICAgICAgICAgICAgICAgIHBhcmVudCAmJiBwYXJlbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5Nb2R1bGVEZWNsYXJhdGlvbjtcbiAgICAgICAgICAgIGNvbnN0IGlzUHJvcGVydHlBc3NpZ25tZW50RXhwcmVzc2lvbiA9IHBhcmVudCAmJiBwYXJlbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcm9wZXJ0eUFzc2lnbm1lbnQ7XG4gICAgICAgICAgICBpZiAoaXNNb2R1bGVEZWNsYXJhdGlvbiB8fCBpc1Byb3BlcnR5QXNzaWdubWVudEV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBnZXRKU0RvY3NXb3JrZXIocGFyZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUHVsbCBwYXJhbWV0ZXIgY29tbWVudHMgZnJvbSBkZWNsYXJpbmcgZnVuY3Rpb24gYXMgd2VsbFxuICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5QYXJhbWV0ZXIpIHtcbiAgICAgICAgICAgICAgICBjYWNoZSA9IGNvbmNhdGVuYXRlKGNhY2hlLCBnZXRKU0RvY1BhcmFtZXRlclRhZ3Mobm9kZSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaXNWYXJpYWJsZUxpa2Uobm9kZSkgJiYgbm9kZS5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgIGNhY2hlID0gY29uY2F0ZW5hdGUoY2FjaGUsIG5vZGUuaW5pdGlhbGl6ZXIuanNEb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYWNoZSA9IGNvbmNhdGVuYXRlKGNhY2hlLCBub2RlLmpzRG9jKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldEpTRG9jczogX2dldEpTRG9jc1xuICAgIH1cbn0pKCk7XG4iLCJleHBvcnQgY29uc3QgZW51bSBBbmd1bGFyTGlmZWN5Y2xlSG9va3Mge1xuICAgIG5nT25DaGFuZ2VzLFxuICAgIG5nT25Jbml0LFxuICAgIG5nRG9DaGVjayxcbiAgICBuZ0FmdGVyQ29udGVudEluaXQsXG4gICAgbmdBZnRlckNvbnRlbnRDaGVja2VkLFxuICAgIG5nQWZ0ZXJWaWV3SW5pdCxcbiAgICBuZ0FmdGVyVmlld0NoZWNrZWQsXG4gICAgbmdPbkRlc3Ryb3lcbn1cbiIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7IExpbmtQYXJzZXIgfSBmcm9tICcuL2xpbmstcGFyc2VyJztcblxuaW1wb3J0IHsgQW5ndWxhckxpZmVjeWNsZUhvb2tzIH0gZnJvbSAnLi9hbmd1bGFyLWxpZmVjeWNsZXMtaG9va3MnO1xuXG5jb25zdCB0cyA9IHJlcXVpcmUoJ3R5cGVzY3JpcHQnKSxcbiAgICAgIGdldEN1cnJlbnREaXJlY3RvcnkgPSB0cy5zeXMuZ2V0Q3VycmVudERpcmVjdG9yeSxcbiAgICAgIHVzZUNhc2VTZW5zaXRpdmVGaWxlTmFtZXMgPSB0cy5zeXMudXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lcyxcbiAgICAgIG5ld0xpbmUgPSB0cy5zeXMubmV3TGluZSxcbiAgICAgIG1hcmtlZCA9IHJlcXVpcmUoJ21hcmtlZCcpLFxuICAgICAgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmV3TGluZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBuZXdMaW5lO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2Fub25pY2FsRmlsZU5hbWUoZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHVzZUNhc2VTZW5zaXRpdmVGaWxlTmFtZXMgPyBmaWxlTmFtZSA6IGZpbGVOYW1lLnRvTG93ZXJDYXNlKCk7XG59XG5cbmV4cG9ydCBjb25zdCBmb3JtYXREaWFnbm9zdGljc0hvc3Q6IHRzLkZvcm1hdERpYWdub3N0aWNzSG9zdCA9IHtcbiAgICBnZXRDdXJyZW50RGlyZWN0b3J5LFxuICAgIGdldENhbm9uaWNhbEZpbGVOYW1lLFxuICAgIGdldE5ld0xpbmVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcmtlZHRhZ3ModGFncykge1xuICAgIHZhciBtdGFncyA9IHRhZ3M7XG4gICAgXy5mb3JFYWNoKG10YWdzLCAodGFnKSA9PiB7XG4gICAgICAgIHRhZy5jb21tZW50ID0gbWFya2VkKExpbmtQYXJzZXIucmVzb2x2ZUxpbmtzKHRhZy5jb21tZW50KSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIG10YWdzO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRDb25maWcoY29uZmlnRmlsZTogc3RyaW5nKTogYW55IHtcbiAgICBsZXQgcmVzdWx0ID0gdHMucmVhZENvbmZpZ0ZpbGUoY29uZmlnRmlsZSwgdHMuc3lzLnJlYWRGaWxlKTtcbiAgICBpZiAocmVzdWx0LmVycm9yKSB7XG4gICAgICAgIGxldCBtZXNzYWdlID0gdHMuZm9ybWF0RGlhZ25vc3RpY3MoW3Jlc3VsdC5lcnJvcl0sIGZvcm1hdERpYWdub3N0aWNzSG9zdCk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdC5jb25maWc7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBCb20oc291cmNlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmIChzb3VyY2UuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG5cdFx0cmV0dXJuIHNvdXJjZS5zbGljZSgxKTtcblx0fVxuXHRyZXR1cm4gc291cmNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzQm9tKHNvdXJjZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChzb3VyY2UuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZVBhdGgoZmlsZXM6IHN0cmluZ1tdLCBjd2Q6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICBsZXQgX2ZpbGVzID0gZmlsZXMsXG4gICAgICAgIGkgPSAwLFxuICAgICAgICBsZW4gPSBmaWxlcy5sZW5ndGg7XG5cbiAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICBpZiAoZmlsZXNbaV0uaW5kZXhPZihjd2QpID09PSAtMSkge1xuICAgICAgICAgICAgZmlsZXNbaV0gPSBwYXRoLnJlc29sdmUoY3dkICsgcGF0aC5zZXAgKyBmaWxlc1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gX2ZpbGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5MaWZlY3ljbGVIb29rc0Zyb21NZXRob2RzKG1ldGhvZHMpIHtcbiAgICB2YXIgcmVzdWx0ID0gW10sXG4gICAgICAgIGkgPSAwLFxuICAgICAgICBsZW4gPSBtZXRob2RzLmxlbmd0aDtcblxuICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgIGlmICghbWV0aG9kc1tpXS5uYW1lIGluIEFuZ3VsYXJMaWZlY3ljbGVIb29rcykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2NsZWFuJyk7XG4gICAgICAgICAgICByZXN1bHQucHVzaChtZXRob2RzW2ldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG4iLCJjb25zdCB0cyA9IHJlcXVpcmUoJ3R5cGVzY3JpcHQnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGtpbmRUb1R5cGUoa2luZDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICBsZXQgX3R5cGUgPSAnJztcbiAgICBzd2l0Y2goa2luZCkge1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nS2V5d29yZDpcbiAgICAgICAgICAgIF90eXBlID0gJ3N0cmluZyc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bWJlcktleXdvcmQ6XG4gICAgICAgICAgICBfdHlwZSA9ICdudW1iZXInO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BcnJheVR5cGU6XG4gICAgICAgICAgICBfdHlwZSA9ICdbXSc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlZvaWRLZXl3b3JkOlxuICAgICAgICAgICAgX3R5cGUgPSAndm9pZCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkJvb2xlYW5LZXl3b3JkOlxuICAgICAgICAgICAgX3R5cGUgPSAnYm9vbGVhbic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkFueUtleXdvcmQ6XG4gICAgICAgICAgICBfdHlwZSA9ICdhbnknO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5OZXZlcktleXdvcmQ6XG4gICAgICAgICAgICBfdHlwZSA9ICduZXZlcic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk9iamVjdEtleXdvcmQ6XG4gICAgICAgICAgICBfdHlwZSA9ICdvYmplY3QnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBfdHlwZTtcbn1cbiIsImNvbnN0IHRzID0gcmVxdWlyZSgndHlwZXNjcmlwdCcpO1xuXG5sZXQgY29kZTogc3RyaW5nW10gPSBbXTtcblxuZXhwb3J0IGxldCBnZW4gPSAoZnVuY3Rpb24gKCkge1xuICAgIGxldCB0bXA6IHR5cGVvZiBjb2RlID0gW107XG5cbiAgICByZXR1cm4gKHRva2VuID0gbnVsbCkgPT4ge1xuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcgISB0b2tlbicpO1xuICAgICAgICAgICAgcmV0dXJuIGNvZGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodG9rZW4gPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcgXFxuJyk7XG4gICAgICAgICAgICBjb2RlLnB1c2godG1wLmpvaW4oJycpKTtcbiAgICAgICAgICAgIHRtcCA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29kZS5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29kZTtcbiAgICB9XG59ICgpKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlKG5vZGU6IGFueSkge1xuICAgIGNvZGUgPSBbXTtcbiAgICB2aXNpdEFuZFJlY29nbml6ZShub2RlKTtcbiAgICByZXR1cm4gY29kZS5qb2luKCcnKTtcbn1cblxuZnVuY3Rpb24gdmlzaXRBbmRSZWNvZ25pemUobm9kZTogYW55LCBkZXB0aCA9IDApIHtcbiAgICByZWNvZ25pemUobm9kZSk7XG4gICAgZGVwdGgrKztcbiAgICBub2RlLmdldENoaWxkcmVuKCkuZm9yRWFjaChjID0+IHZpc2l0QW5kUmVjb2duaXplKGMsIGRlcHRoKSk7XG59XG5cbmZ1bmN0aW9uIHJlY29nbml6ZShub2RlOiBhbnkpIHtcblxuICAgIC8vY29uc29sZS5sb2coJ3JlY29nbml6aW5nLi4uJywgdHMuU3ludGF4S2luZFtub2RlLmtpbmQrJyddKTtcblxuICAgIHN3aXRjaCAobm9kZS5raW5kKSB7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5GaXJzdExpdGVyYWxUb2tlbjpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICAgICAgICBnZW4oJ1xcXCInKTtcbiAgICAgICAgICAgIGdlbihub2RlLnRleHQpO1xuICAgICAgICAgICAgZ2VuKCdcXFwiJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWw6XG4gICAgICAgICAgICBnZW4oJ1xcXCInKTtcbiAgICAgICAgICAgIGdlbihub2RlLnRleHQpO1xuICAgICAgICAgICAgZ2VuKCdcXFwiJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGJyZWFrO1xuXG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkltcG9ydEtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ2ltcG9ydCcpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZyb21LZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdmcm9tJyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXhwb3J0S2V5d29yZDpcbiAgICAgICAgICAgIGdlbignXFxuJyk7XG4gICAgICAgICAgICBnZW4oJ2V4cG9ydCcpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xhc3NLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdjbGFzcycpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRoaXNLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCd0aGlzJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbnN0cnVjdG9yS2V5d29yZDpcbiAgICAgICAgICAgIGdlbignY29uc3RydWN0b3InKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5GYWxzZUtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ2ZhbHNlJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRydWVLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCd0cnVlJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bGxLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdudWxsJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXRUb2tlbjpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUGx1c1Rva2VuOlxuICAgICAgICAgICAgZ2VuKCcrJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkVxdWFsc0dyZWF0ZXJUaGFuVG9rZW46XG4gICAgICAgICAgICBnZW4oJyA9PiAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5PcGVuUGFyZW5Ub2tlbjpcbiAgICAgICAgICAgIGdlbignKCcpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkltcG9ydENsYXVzZTpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk9iamVjdExpdGVyYWxFeHByZXNzaW9uOlxuICAgICAgICAgICAgZ2VuKCd7Jyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQmxvY2s6XG4gICAgICAgICAgICBnZW4oJ3snKTtcbiAgICAgICAgICAgIGdlbignXFxuJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xvc2VCcmFjZVRva2VuOlxuICAgICAgICAgICAgZ2VuKCd9Jyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNsb3NlUGFyZW5Ub2tlbjpcbiAgICAgICAgICAgIGdlbignKScpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5PcGVuQnJhY2tldFRva2VuOlxuICAgICAgICAgICAgZ2VuKCdbJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNsb3NlQnJhY2tldFRva2VuOlxuICAgICAgICAgICAgZ2VuKCddJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU2VtaWNvbG9uVG9rZW46XG4gICAgICAgICAgICBnZW4oJzsnKTtcbiAgICAgICAgICAgIGdlbignXFxuJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbW1hVG9rZW46XG4gICAgICAgICAgICBnZW4oJywnKTtcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Db2xvblRva2VuOlxuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBnZW4oJzonKTtcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Eb3RUb2tlbjpcbiAgICAgICAgICAgIGdlbignLicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Eb1N0YXRlbWVudDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRGVjb3JhdG9yOlxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZpcnN0QXNzaWdubWVudDpcbiAgICAgICAgICAgIGdlbignID0gJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZpcnN0UHVuY3R1YXRpb246XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcml2YXRlS2V5d29yZDpcbiAgICAgICAgICAgIGdlbigncHJpdmF0ZScpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlB1YmxpY0tleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ3B1YmxpYycpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IEZpbGVFbmdpbmUgfSBmcm9tICcuL2ZpbGUuZW5naW5lJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uLy4uL2xvZ2dlcic7XG5cbmNvbnN0ICQ6IGFueSA9IHJlcXVpcmUoJ2NoZWVyaW8nKSxcbiAgICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxuY2xhc3MgQ29tcG9uZW50c1RyZWVFbmdpbmUge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogQ29tcG9uZW50c1RyZWVFbmdpbmUgPSBuZXcgQ29tcG9uZW50c1RyZWVFbmdpbmUoKTtcbiAgICBjb21wb25lbnRzOiBhbnlbXSA9IFtdO1xuICAgIGNvbXBvbmVudHNGb3JUcmVlOiBhbnlbXSA9IFtdO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZiAoQ29tcG9uZW50c1RyZWVFbmdpbmUuX2luc3RhbmNlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yOiBJbnN0YW50aWF0aW9uIGZhaWxlZDogVXNlIENvbXBvbmVudHNUcmVlRW5naW5lLmdldEluc3RhbmNlKCkgaW5zdGVhZCBvZiBuZXcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgQ29tcG9uZW50c1RyZWVFbmdpbmUuX2luc3RhbmNlID0gdGhpcztcbiAgICB9XG4gICAgcHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZSgpOiBDb21wb25lbnRzVHJlZUVuZ2luZSB7XG4gICAgICAgIHJldHVybiBDb21wb25lbnRzVHJlZUVuZ2luZS5faW5zdGFuY2U7XG4gICAgfVxuICAgIGFkZENvbXBvbmVudChjb21wb25lbnQpIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcbiAgICB9XG4gICAgcmVhZFRlbXBsYXRlcygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSB0aGlzLmNvbXBvbmVudHNGb3JUcmVlLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAkZmlsZWVuZ2luZSA9IG5ldyBGaWxlRW5naW5lKCksXG4gICAgICAgICAgICAgICAgbG9vcCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPD0gbGVuIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29tcG9uZW50c0ZvclRyZWVbaV0udGVtcGxhdGVVcmwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZmlsZWVuZ2luZS5nZXQocGF0aC5kaXJuYW1lKHRoaXMuY29tcG9uZW50c0ZvclRyZWVbaV0uZmlsZSkgKyBwYXRoLnNlcCArIHRoaXMuY29tcG9uZW50c0ZvclRyZWVbaV0udGVtcGxhdGVVcmwpLnRoZW4oKHRlbXBsYXRlRGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXBvbmVudHNGb3JUcmVlW2ldLnRlbXBsYXRlRGF0YSA9IHRlbXBsYXRlRGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXBvbmVudHNGb3JUcmVlW2ldLnRlbXBsYXRlRGF0YSA9IHRoaXMuY29tcG9uZW50c0ZvclRyZWVbaV0udGVtcGxhdGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZmluZENoaWxkcmVuQW5kUGFyZW50cygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbXBvbmVudHNGb3JUcmVlLCAoY29tcG9uZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0ICRjb21wb25lbnQgPSAkKGNvbXBvbmVudC50ZW1wbGF0ZURhdGEpO1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbXBvbmVudHNGb3JUcmVlLCAoY29tcG9uZW50VG9GaW5kKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgkY29tcG9uZW50LmZpbmQoY29tcG9uZW50VG9GaW5kLnNlbGVjdG9yKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjb21wb25lbnRUb0ZpbmQubmFtZSArICcgZm91bmQgaW4gJyArIGNvbXBvbmVudC5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5jaGlsZHJlbi5wdXNoKGNvbXBvbmVudFRvRmluZC5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjcmVhdGVUcmVlc0ZvckNvbXBvbmVudHMoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBfLmZvckVhY2godGhpcy5jb21wb25lbnRzLCAoY29tcG9uZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IF9jb21wb25lbnQgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbXBvbmVudC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBmaWxlOiBjb21wb25lbnQuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IGNvbXBvbmVudC5zZWxlY3RvcixcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJycsXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbXBvbmVudC50ZW1wbGF0ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgX2NvbXBvbmVudC50ZW1wbGF0ZSA9IGNvbXBvbmVudC50ZW1wbGF0ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LnRlbXBsYXRlVXJsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgX2NvbXBvbmVudC50ZW1wbGF0ZVVybCA9IGNvbXBvbmVudC50ZW1wbGF0ZVVybFswXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNvbXBvbmVudHNGb3JUcmVlLnB1c2goX2NvbXBvbmVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucmVhZFRlbXBsYXRlcygpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZmluZENoaWxkcmVuQW5kUGFyZW50cygpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcy5jb21wb25lbnRzRm9yVHJlZTogJywgdGhpcy5jb21wb25lbnRzRm9yVHJlZSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9LCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0ICRjb21wb25lbnRzVHJlZUVuZ2luZSA9IENvbXBvbmVudHNUcmVlRW5naW5lLmdldEluc3RhbmNlKCk7XG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzLWV4dHJhJztcblxuaW1wb3J0IHsgY29tcGlsZXJIb3N0LCBkZXRlY3RJbmRlbnQgfSBmcm9tICcuLi8uLi91dGlsaXRpZXMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vLi4vbG9nZ2VyJztcbmltcG9ydCB7IFJvdXRlclBhcnNlciB9IGZyb20gJy4uLy4uL3V0aWxzL3JvdXRlci5wYXJzZXInO1xuaW1wb3J0IHsgTGlua1BhcnNlciB9IGZyb20gJy4uLy4uL3V0aWxzL2xpbmstcGFyc2VyJztcbmltcG9ydCB7IEpTRG9jVGFnc1BhcnNlciB9IGZyb20gJy4uLy4uL3V0aWxzL2pzZG9jLnBhcnNlcic7XG5pbXBvcnQgeyBtYXJrZWR0YWdzIH0gZnJvbSAnLi4vLi4vdXRpbHMvdXRpbHMnO1xuaW1wb3J0IHsga2luZFRvVHlwZSB9IGZyb20gJy4uLy4uL3V0aWxzL2tpbmQtdG8tdHlwZSc7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gJy4vY29kZWdlbic7XG5pbXBvcnQgeyBzdHJpcEJvbSwgaGFzQm9tLCBjbGVhbkxpZmVjeWNsZUhvb2tzRnJvbU1ldGhvZHMgfSBmcm9tICcuLi8uLi91dGlscy91dGlscyc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vY29uZmlndXJhdGlvbic7XG5pbXBvcnQgeyAkY29tcG9uZW50c1RyZWVFbmdpbmUgfSBmcm9tICcuLi9lbmdpbmVzL2NvbXBvbmVudHMtdHJlZS5lbmdpbmUnO1xuXG5jb25zdCBtYXJrZWQgPSByZXF1aXJlKCdtYXJrZWQnKSxcbiAgICAgIHRzID0gcmVxdWlyZSgndHlwZXNjcmlwdCcpLFxuICAgICAgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG4vLyBUeXBlU2NyaXB0IHJlZmVyZW5jZSA6IGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9ibG9iL21hc3Rlci9saWIvdHlwZXNjcmlwdC5kLnRzXG5cbmludGVyZmFjZSBOb2RlT2JqZWN0IHtcbiAgICBraW5kOiBOdW1iZXI7XG4gICAgcG9zOiBOdW1iZXI7XG4gICAgZW5kOiBOdW1iZXI7XG4gICAgdGV4dDogc3RyaW5nO1xuICAgIGluaXRpYWxpemVyOiBOb2RlT2JqZWN0LFxuICAgIG5hbWU/OiB7IHRleHQ6IHN0cmluZyB9O1xuICAgIGV4cHJlc3Npb24/OiBOb2RlT2JqZWN0O1xuICAgIGVsZW1lbnRzPzogTm9kZU9iamVjdFtdO1xuICAgIGFyZ3VtZW50cz86IE5vZGVPYmplY3RbXTtcbiAgICBwcm9wZXJ0aWVzPzogYW55W107XG4gICAgcGFyc2VyQ29udGV4dEZsYWdzPzogTnVtYmVyO1xuICAgIGVxdWFsc0dyZWF0ZXJUaGFuVG9rZW4/OiBOb2RlT2JqZWN0W107XG4gICAgcGFyYW1ldGVycz86IE5vZGVPYmplY3RbXTtcbiAgICBDb21wb25lbnQ/OiBzdHJpbmc7XG4gICAgYm9keT86IHtcbiAgICAgICAgcG9zOiBOdW1iZXI7XG4gICAgICAgIGVuZDogTnVtYmVyO1xuICAgICAgICBzdGF0ZW1lbnRzOiBOb2RlT2JqZWN0W107XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgRGVwcyB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHR5cGU6IHN0cmluZztcbiAgICBsYWJlbD86IHN0cmluZztcbiAgICBmaWxlPzogc3RyaW5nO1xuICAgIHNvdXJjZUNvZGU/OiBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG5cbiAgICAvL0NvbXBvbmVudFxuXG4gICAgYW5pbWF0aW9ucz86IHN0cmluZ1tdOyAvLyBUT0RPXG4gICAgY2hhbmdlRGV0ZWN0aW9uPzogc3RyaW5nO1xuICAgIGVuY2Fwc3VsYXRpb24/OiBzdHJpbmc7XG4gICAgZW50cnlDb21wb25lbnRzPzogc3RyaW5nOyAvLyBUT0RPXG4gICAgZXhwb3J0QXM/OiBzdHJpbmc7XG4gICAgaG9zdD86IHN0cmluZztcbiAgICBpbnB1dHM/OiBzdHJpbmdbXTtcbiAgICBpbnRlcnBvbGF0aW9uPzogc3RyaW5nOyAvLyBUT0RPXG4gICAgbW9kdWxlSWQ/OiBzdHJpbmc7XG4gICAgb3V0cHV0cz86IHN0cmluZ1tdO1xuICAgIHF1ZXJpZXM/OiBEZXBzW107IC8vIFRPRE9cbiAgICBzZWxlY3Rvcj86IHN0cmluZztcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXTtcbiAgICBzdHlsZXM/OiBzdHJpbmdbXTtcbiAgICB0ZW1wbGF0ZT86IHN0cmluZztcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZ1tdO1xuICAgIHZpZXdQcm92aWRlcnM/OiBzdHJpbmdbXTtcblxuICAgIGltcGxlbWVudHM/O1xuICAgIGV4dGVuZHM/O1xuXG4gICAgaW5wdXRzQ2xhc3M/OiBPYmplY3RbXTtcbiAgICBvdXRwdXRzQ2xhc3M/OiBPYmplY3RbXTtcbiAgICBwcm9wZXJ0aWVzQ2xhc3M/OiBPYmplY3RbXTtcbiAgICBtZXRob2RzQ2xhc3M/OiBPYmplY3RbXTtcblxuICAgIC8vY29tbW9uXG4gICAgcHJvdmlkZXJzPzogRGVwc1tdO1xuXG4gICAgLy9tb2R1bGVcbiAgICBkZWNsYXJhdGlvbnM/OiBEZXBzW107XG4gICAgYm9vdHN0cmFwPzogRGVwc1tdO1xuXG4gICAgaW1wb3J0cz86IERlcHNbXTtcbiAgICBleHBvcnRzPzogRGVwc1tdO1xuXG4gICAgcm91dGVzVHJlZT87XG59XG5cbmludGVyZmFjZSBTeW1ib2xEZXBzIHtcbiAgICBmdWxsOiBzdHJpbmc7XG4gICAgYWxpYXM6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIERlcGVuZGVuY2llcyB7XG5cbiAgICBwcml2YXRlIGZpbGVzOiBzdHJpbmdbXTtcbiAgICBwcml2YXRlIHByb2dyYW06IHRzLlByb2dyYW07XG4gICAgcHJpdmF0ZSB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXI7XG4gICAgcHJpdmF0ZSBlbmdpbmU6IGFueTtcbiAgICBwcml2YXRlIF9fY2FjaGU6IGFueSA9IHt9O1xuICAgIHByaXZhdGUgX19uc01vZHVsZTogYW55ID0ge307XG4gICAgcHJpdmF0ZSB1bmtub3duID0gJz8/Pyc7XG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uID0gQ29uZmlndXJhdGlvbi5nZXRJbnN0YW5jZSgpO1xuXG4gICAgY29uc3RydWN0b3IoZmlsZXM6IHN0cmluZ1tdLCBvcHRpb25zOiBhbnkpIHtcbiAgICAgICAgdGhpcy5maWxlcyA9IGZpbGVzO1xuICAgICAgICBjb25zdCB0cmFuc3BpbGVPcHRpb25zID0ge1xuICAgICAgICAgICAgdGFyZ2V0OiB0cy5TY3JpcHRUYXJnZXQuRVM1LFxuICAgICAgICAgICAgbW9kdWxlOiB0cy5Nb2R1bGVLaW5kLkNvbW1vbkpTLFxuICAgICAgICAgICAgdHNjb25maWdEaXJlY3Rvcnk6IG9wdGlvbnMudHNjb25maWdEaXJlY3RvcnlcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5wcm9ncmFtID0gdHMuY3JlYXRlUHJvZ3JhbSh0aGlzLmZpbGVzLCB0cmFuc3BpbGVPcHRpb25zLCBjb21waWxlckhvc3QodHJhbnNwaWxlT3B0aW9ucykpO1xuICAgICAgICB0aGlzLnR5cGVDaGVja2VyID0gdGhpcy5wcm9ncmFtLmdldFR5cGVDaGVja2VyKCk7XG4gICAgfVxuXG4gICAgZ2V0RGVwZW5kZW5jaWVzKCkge1xuICAgICAgICBsZXQgZGVwczogYW55ID0ge1xuICAgICAgICAgICAgJ21vZHVsZXMnOiBbXSxcbiAgICAgICAgICAgICdjb21wb25lbnRzJzogW10sXG4gICAgICAgICAgICAnaW5qZWN0YWJsZXMnOiBbXSxcbiAgICAgICAgICAgICdwaXBlcyc6IFtdLFxuICAgICAgICAgICAgJ2RpcmVjdGl2ZXMnOiBbXSxcbiAgICAgICAgICAgICdyb3V0ZXMnOiBbXSxcbiAgICAgICAgICAgICdjbGFzc2VzJzogW10sXG4gICAgICAgICAgICAnaW50ZXJmYWNlcyc6IFtdLFxuICAgICAgICAgICAgJ21pc2NlbGxhbmVvdXMnOiB7XG4gICAgICAgICAgICAgICAgdmFyaWFibGVzOiBbXSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbnM6IFtdLFxuICAgICAgICAgICAgICAgIHR5cGVhbGlhc2VzOiBbXSxcbiAgICAgICAgICAgICAgICBlbnVtZXJhdGlvbnM6IFtdLFxuICAgICAgICAgICAgICAgIHR5cGVzOiBbXVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBzb3VyY2VGaWxlcyA9IHRoaXMucHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpIHx8IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDbGVhbiBmaWxlcyB3aXRoIFVURi04IEJPTVxuICAgICAgICAgKi9cbiAgICAgICAgc291cmNlRmlsZXMuZm9yRWFjaCgoZmlsZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGxldCBmaWxlUGF0aCA9IGZpbGUuZmlsZU5hbWU7XG5cbiAgICAgICAgICAgIGlmIChwYXRoLmV4dG5hbWUoZmlsZVBhdGgpID09PSAnLnRzJykge1xuICAgICAgICAgICAgICAgIGlmIChmaWxlUGF0aC5sYXN0SW5kZXhPZignLmQudHMnKSA9PT0gLTEgJiYgZmlsZVBhdGgubGFzdEluZGV4T2YoJ3NwZWMudHMnKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhc0JvbShmaWxlLnRleHQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGV4dCA9IHN0cmlwQm9tKGZpbGUudGV4dCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHQgPSBmaWxlLnVwZGF0ZSh0ZXh0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0xlbmd0aDogdGV4dC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwYW46IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBmaWxlLnRleHQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdHQubW9kdWxlQXVnbWVudGF0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR0Lm1vZHVsZUF1Z21lbnRhdGlvbnMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUZpbGVzW2luZGV4XSA9IHR0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBzb3VyY2VGaWxlcy5tYXAoKGZpbGU6IHRzLlNvdXJjZUZpbGUpID0+IHtcblxuICAgICAgICAgICAgbGV0IGZpbGVQYXRoID0gZmlsZS5maWxlTmFtZTtcblxuICAgICAgICAgICAgaWYgKHBhdGguZXh0bmFtZShmaWxlUGF0aCkgPT09ICcudHMnKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoZmlsZVBhdGgubGFzdEluZGV4T2YoJy5kLnRzJykgPT09IC0xICYmIGZpbGVQYXRoLmxhc3RJbmRleE9mKCdzcGVjLnRzJykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdwYXJzaW5nJywgZmlsZVBhdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldFNvdXJjZUZpbGVEZWNvcmF0b3JzKGZpbGUsIGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSwgZmlsZS5maWxlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRlcHM7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gRW5kIG9mIGZpbGUgc2Nhbm5pbmdcbiAgICAgICAgLy8gVHJ5IG1lcmdpbmcgaW5zaWRlIHRoZSBzYW1lIGZpbGUgZGVjbGFyYXRlZCB2YXJpYWJsZXMgJiBtb2R1bGVzIHdpdGggaW1wb3J0cyB8IGV4cG9ydHMgfCBkZWNsYXJhdGlvbnMgfCBwcm92aWRlcnNcblxuICAgICAgICBpZiAoZGVwc1snbWlzY2VsbGFuZW91cyddLnZhcmlhYmxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBkZXBzWydtaXNjZWxsYW5lb3VzJ10udmFyaWFibGVzLmZvckVhY2goX3ZhcmlhYmxlID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgbmV3VmFyID0gW107XG4gICAgICAgICAgICAgICAgKChfdmFyLCBfbmV3VmFyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGdldFR5cGUgcHIgcmVjb25zdHJ1aXJlLi4uLlxuICAgICAgICAgICAgICAgICAgICBpZiAoX3Zhci5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF92YXIuaW5pdGlhbGl6ZXIuZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3Zhci5pbml0aWFsaXplci5lbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF92YXIuaW5pdGlhbGl6ZXIuZWxlbWVudHMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQudGV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Zhci5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZWxlbWVudC50ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB0aGlzLmdldFR5cGUoZWxlbWVudC50ZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKF92YXJpYWJsZSwgbmV3VmFyKTtcblxuICAgICAgICAgICAgICAgIGRlcHNbJ21vZHVsZXMnXS5mb3JFYWNoKG1vZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtb2QuZmlsZSA9PT0gX3ZhcmlhYmxlLmZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwcm9jZXNzID0gKGluaXRpYWxBcnJheSwgX3ZhcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbmRleFRvQ2xlYW4gPSAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmaW5kVmFyaWFibGVJbkFycmF5ID0gKGVsLCBpbmRleCwgdGhlQXJyYXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsLm5hbWUgPT09IF92YXIubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhUb0NsZWFuID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbEFycmF5LmZvckVhY2goZmluZFZhcmlhYmxlSW5BcnJheSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2xlYW4gaW5kZXhlcyB0byByZXBsYWNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxBcnJheS5zcGxpY2UoaW5kZXhUb0NsZWFuLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIHZhcmlhYmxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Zhci5mb3JFYWNoKChuZXdFbGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgXy5maW5kKGluaXRpYWxBcnJheSwgeyAnbmFtZSc6IG5ld0VsZS5uYW1lfSkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbEFycmF5LnB1c2gobmV3RWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcyhtb2QuaW1wb3J0cywgX3ZhcmlhYmxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3MobW9kLmV4cG9ydHMsIF92YXJpYWJsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzKG1vZC5kZWNsYXJhdGlvbnMsIF92YXJpYWJsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzKG1vZC5wcm92aWRlcnMsIF92YXJpYWJsZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9Sb3V0ZXJQYXJzZXIucHJpbnRNb2R1bGVzUm91dGVzKCk7XG4gICAgICAgIC8vUm91dGVyUGFyc2VyLnByaW50Um91dGVzKCk7XG5cbiAgICAgICAgLyppZiAoUm91dGVyUGFyc2VyLmluY29tcGxldGVSb3V0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaWYgKGRlcHNbJ21pc2NlbGxhbmVvdXMnXVsndmFyaWFibGVzJ10ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIFJvdXRlclBhcnNlci5maXhJbmNvbXBsZXRlUm91dGVzKGRlcHNbJ21pc2NlbGxhbmVvdXMnXVsndmFyaWFibGVzJ10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9Ki9cblxuICAgICAgICAvLyRjb21wb25lbnRzVHJlZUVuZ2luZS5jcmVhdGVUcmVlc0ZvckNvbXBvbmVudHMoKTtcblxuICAgICAgICBSb3V0ZXJQYXJzZXIubGlua01vZHVsZXNBbmRSb3V0ZXMoKTtcbiAgICAgICAgUm91dGVyUGFyc2VyLmNvbnN0cnVjdE1vZHVsZXNUcmVlKCk7XG5cbiAgICAgICAgZGVwcy5yb3V0ZXNUcmVlID0gUm91dGVyUGFyc2VyLmNvbnN0cnVjdFJvdXRlc1RyZWUoKTtcblxuICAgICAgICByZXR1cm4gZGVwcztcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFNvdXJjZUZpbGVEZWNvcmF0b3JzKHNyY0ZpbGU6IHRzLlNvdXJjZUZpbGUsIG91dHB1dFN5bWJvbHM6IE9iamVjdCk6IHZvaWQge1xuXG4gICAgICAgIGxldCBjbGVhbmVyID0gKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCkucmVwbGFjZSgvXFxcXC9nLCAnLycpLFxuICAgICAgICAgICAgZmlsZSA9IHNyY0ZpbGUuZmlsZU5hbWUucmVwbGFjZShjbGVhbmVyLCAnJyk7XG5cbiAgICAgICAgdHMuZm9yRWFjaENoaWxkKHNyY0ZpbGUsIChub2RlOiB0cy5Ob2RlKSA9PiB7XG5cbiAgICAgICAgICAgIGxldCBkZXBzOiBEZXBzID0gPERlcHM+e307XG4gICAgICAgICAgICBpZiAobm9kZS5kZWNvcmF0b3JzKSB7XG4gICAgICAgICAgICAgICAgbGV0IHZpc2l0Tm9kZSA9ICh2aXNpdGVkTm9kZSwgaW5kZXgpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgbWV0YWRhdGEgPSBub2RlLmRlY29yYXRvcnM7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gdGhpcy5nZXRTeW1ib2xlTmFtZShub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByb3BzID0gdGhpcy5maW5kUHJvcHModmlzaXRlZE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgSU8gPSB0aGlzLmdldENvbXBvbmVudElPKGZpbGUsIHNyY0ZpbGUsIG5vZGUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzTW9kdWxlKG1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzOiB0aGlzLmdldE1vZHVsZVByb3ZpZGVycyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjbGFyYXRpb25zOiB0aGlzLmdldE1vZHVsZURlY2xhdGlvbnMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltcG9ydHM6IHRoaXMuZ2V0TW9kdWxlSW1wb3J0cyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3J0czogdGhpcy5nZXRNb2R1bGVFeHBvcnRzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib290c3RyYXA6IHRoaXMuZ2V0TW9kdWxlQm9vdHN0cmFwKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbW9kdWxlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogSU8uZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc3JjRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoUm91dGVyUGFyc2VyLmhhc1JvdXRlck1vZHVsZUluSW1wb3J0cyhkZXBzLmltcG9ydHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLmFkZE1vZHVsZVdpdGhSb3V0ZXMobmFtZSwgdGhpcy5nZXRNb2R1bGVJbXBvcnRzUmF3KHByb3BzKSwgZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBSb3V0ZXJQYXJzZXIuYWRkTW9kdWxlKG5hbWUsIGRlcHMuaW1wb3J0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydtb2R1bGVzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmlzQ29tcG9uZW50KG1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYocHJvcHMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHV0aWwuaW5zcGVjdChwcm9wcywgeyBzaG93SGlkZGVuOiB0cnVlLCBkZXB0aDogMTAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hbmltYXRpb25zPzogc3RyaW5nW107IC8vIFRPRE9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VEZXRlY3Rpb246IHRoaXMuZ2V0Q29tcG9uZW50Q2hhbmdlRGV0ZWN0aW9uKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNhcHN1bGF0aW9uOiB0aGlzLmdldENvbXBvbmVudEVuY2Fwc3VsYXRpb24ocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZW50cnlDb21wb25lbnRzPzogc3RyaW5nOyAvLyBUT0RPIHdhaXRpbmcgZG9jIGluZm9zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3J0QXM6IHRoaXMuZ2V0Q29tcG9uZW50RXhwb3J0QXMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvc3Q6IHRoaXMuZ2V0Q29tcG9uZW50SG9zdChwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiB0aGlzLmdldENvbXBvbmVudElucHV0c01ldGFkYXRhKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2ludGVycG9sYXRpb24/OiBzdHJpbmc7IC8vIFRPRE8gd2FpdGluZyBkb2MgaW5mb3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJZDogdGhpcy5nZXRDb21wb25lbnRNb2R1bGVJZChwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0czogdGhpcy5nZXRDb21wb25lbnRPdXRwdXRzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IHRoaXMuZ2V0Q29tcG9uZW50UHJvdmlkZXJzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3F1ZXJpZXM/OiBEZXBzW107IC8vIFRPRE9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogdGhpcy5nZXRDb21wb25lbnRTZWxlY3Rvcihwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVVcmxzOiB0aGlzLmdldENvbXBvbmVudFN0eWxlVXJscyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVzOiB0aGlzLmdldENvbXBvbmVudFN0eWxlcyhwcm9wcyksIC8vIFRPRE8gZml4IGFyZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGhpcy5nZXRDb21wb25lbnRUZW1wbGF0ZShwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IHRoaXMuZ2V0Q29tcG9uZW50VGVtcGxhdGVVcmwocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdQcm92aWRlcnM6IHRoaXMuZ2V0Q29tcG9uZW50Vmlld1Byb3ZpZGVycyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzQ2xhc3M6IElPLmlucHV0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRzQ2xhc3M6IElPLm91dHB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllc0NsYXNzOiBJTy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHNDbGFzczogSU8ubWV0aG9kcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogSU8uZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NvbXBvbmVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc3JjRmlsZS5nZXRUZXh0KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhhbXBsZVVybHM6IF90aGlzLmdldENvbXBvbmVudEV4YW1wbGVVcmxzKHNyY0ZpbGUuZ2V0VGV4dCgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZVByaXZhdGVPckludGVybmFsU3VwcG9ydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMubWV0aG9kc0NsYXNzID0gY2xlYW5MaWZlY3ljbGVIb29rc0Zyb21NZXRob2RzKGRlcHMubWV0aG9kc0NsYXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChJTy5qc2RvY3RhZ3MgJiYgSU8uanNkb2N0YWdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmpzZG9jdGFncyA9IElPLmpzZG9jdGFnc1swXS50YWdzXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihJTy5jb25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuY29uc3RydWN0b3JPYmogPSBJTy5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChJTy5leHRlbmRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5leHRlbmRzID0gSU8uZXh0ZW5kcztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChJTy5pbXBsZW1lbnRzICYmIElPLmltcGxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuaW1wbGVtZW50cyA9IElPLmltcGxlbWVudHM7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAkY29tcG9uZW50c1RyZWVFbmdpbmUuYWRkQ29tcG9uZW50KGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snY29tcG9uZW50cyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pc0luamVjdGFibGUobWV0YWRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5qZWN0YWJsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogSU8ucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiBJTy5tZXRob2RzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBJTy5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzcmNGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKElPLmNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5jb25zdHJ1Y3Rvck9iaiA9IElPLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snaW5qZWN0YWJsZXMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaXNQaXBlKG1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3BpcGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBJTy5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzcmNGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChJTy5qc2RvY3RhZ3MgJiYgSU8uanNkb2N0YWdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmpzZG9jdGFncyA9IElPLmpzZG9jdGFnc1swXS50YWdzXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydwaXBlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pc0RpcmVjdGl2ZShtZXRhZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHByb3BzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2RpcmVjdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IElPLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNyY0ZpbGUuZ2V0VGV4dCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiB0aGlzLmdldENvbXBvbmVudFNlbGVjdG9yKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IHRoaXMuZ2V0Q29tcG9uZW50UHJvdmlkZXJzKHByb3BzKSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0c0NsYXNzOiBJTy5pbnB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0c0NsYXNzOiBJTy5vdXRwdXRzLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllc0NsYXNzOiBJTy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHNDbGFzczogSU8ubWV0aG9kcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGFtcGxlVXJsczogX3RoaXMuZ2V0Q29tcG9uZW50RXhhbXBsZVVybHMoc3JjRmlsZS5nZXRUZXh0KCkpXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKElPLmpzZG9jdGFncyAmJiBJTy5qc2RvY3RhZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuanNkb2N0YWdzID0gSU8uanNkb2N0YWdzWzBdLnRhZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChJTy5pbXBsZW1lbnRzICYmIElPLmltcGxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuaW1wbGVtZW50cyA9IElPLmltcGxlbWVudHM7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihJTy5jb25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuY29uc3RydWN0b3JPYmogPSBJTy5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2RpcmVjdGl2ZXMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1ZyhkZXBzKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9fY2FjaGVbbmFtZV0gPSBkZXBzO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBmaWx0ZXJCeURlY29yYXRvcnMgPSAobm9kZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5leHByZXNzaW9uICYmIG5vZGUuZXhwcmVzc2lvbi5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLyhOZ01vZHVsZXxDb21wb25lbnR8SW5qZWN0YWJsZXxQaXBlfERpcmVjdGl2ZSkvLnRlc3Qobm9kZS5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIG5vZGUuZGVjb3JhdG9yc1xuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGZpbHRlckJ5RGVjb3JhdG9ycylcbiAgICAgICAgICAgICAgICAgICAgLmZvckVhY2godmlzaXROb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUuc3ltYm9sKSB7XG4gICAgICAgICAgICAgICAgaWYobm9kZS5zeW1ib2wuZmxhZ3MgPT09IHRzLlN5bWJvbEZsYWdzLkNsYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gdGhpcy5nZXRTeW1ib2xlTmFtZShub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5nZXRDbGFzc0lPKGZpbGUsIHNyY0ZpbGUsIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY2xhc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc3JjRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYoSU8uY29uc3RydWN0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuY29uc3RydWN0b3JPYmogPSBJTy5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLnByb3BlcnRpZXMgPSBJTy5wcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLmRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmRlc2NyaXB0aW9uID0gSU8uZGVzY3JpcHRpb247XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ubWV0aG9kcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5tZXRob2RzID0gSU8ubWV0aG9kcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoSU8uZXh0ZW5kcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5leHRlbmRzID0gSU8uZXh0ZW5kcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoSU8uaW1wbGVtZW50cyAmJiBJTy5pbXBsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuaW1wbGVtZW50cyA9IElPLmltcGxlbWVudHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1ZyhkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snY2xhc3NlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKG5vZGUuc3ltYm9sLmZsYWdzID09PSB0cy5TeW1ib2xGbGFncy5JbnRlcmZhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSB0aGlzLmdldFN5bWJvbGVOYW1lKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgSU8gPSB0aGlzLmdldEludGVyZmFjZUlPKGZpbGUsIHNyY0ZpbGUsIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW50ZXJmYWNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNyY0ZpbGUuZ2V0VGV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMucHJvcGVydGllcyA9IElPLnByb3BlcnRpZXM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8uaW5kZXhTaWduYXR1cmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmluZGV4U2lnbmF0dXJlcyA9IElPLmluZGV4U2lnbmF0dXJlcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5raW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmtpbmQgPSBJTy5raW5kO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLmRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmRlc2NyaXB0aW9uID0gSU8uZGVzY3JpcHRpb247XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ubWV0aG9kcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5tZXRob2RzID0gSU8ubWV0aG9kcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydpbnRlcmZhY2VzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5GdW5jdGlvbkRlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmZvcyA9IHRoaXMudmlzaXRGdW5jdGlvbkRlY2xhcmF0aW9uKG5vZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFncyA9IHRoaXMudmlzaXRGdW5jdGlvbkRlY2xhcmF0aW9uSlNEb2NUYWdzKG5vZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGluZm9zLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnZpc2l0RW51bUFuZEZ1bmN0aW9uRGVjbGFyYXRpb25EZXNjcmlwdGlvbihub2RlKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmZvcy5hcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmFyZ3MgPSBpbmZvcy5hcmdzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0YWdzICYmIHRhZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5qc2RvY3RhZ3MgPSB0YWdzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ21pc2NlbGxhbmVvdXMnXS5mdW5jdGlvbnMucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5FbnVtRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluZm9zID0gdGhpcy52aXNpdEVudW1EZWNsYXJhdGlvbihub2RlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBub2RlLm5hbWUudGV4dDtcbiAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHM6IGluZm9zLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMudmlzaXRFbnVtQW5kRnVuY3Rpb25EZWNsYXJhdGlvbkRlc2NyaXB0aW9uKG5vZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ21pc2NlbGxhbmVvdXMnXS5lbnVtZXJhdGlvbnMucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBJTyA9IHRoaXMuZ2V0Um91dGVJTyhmaWxlLCBzcmNGaWxlKTtcbiAgICAgICAgICAgICAgICBpZihJTy5yb3V0ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1JvdXRlcztcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1JvdXRlcyA9IFJvdXRlclBhcnNlci5jbGVhblJhd1JvdXRlUGFyc2VkKElPLnJvdXRlcyk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignUm91dGVzIHBhcnNpbmcgZXJyb3IsIG1heWJlIGEgdHJhaWxpbmcgY29tbWEgb3IgYW4gZXh0ZXJuYWwgdmFyaWFibGUsIHRyeWluZyB0byBmaXggdGhhdCBsYXRlciBhZnRlciBzb3VyY2VzIHNjYW5uaW5nLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Um91dGVzID0gSU8ucm91dGVzLnJlcGxhY2UoLyAvZ20sICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLmFkZEluY29tcGxldGVSb3V0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbmV3Um91dGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1sncm91dGVzJ10gPSBbLi4ub3V0cHV0U3ltYm9sc1sncm91dGVzJ10sIC4uLm5ld1JvdXRlc107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IHRoaXMuZ2V0U3ltYm9sZU5hbWUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBJTyA9IHRoaXMuZ2V0Q2xhc3NJTyhmaWxlLCBzcmNGaWxlLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NsYXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNyY0ZpbGUuZ2V0VGV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLmNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmNvbnN0cnVjdG9yT2JqID0gSU8uY29uc3RydWN0b3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ucHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5wcm9wZXJ0aWVzID0gSU8ucHJvcGVydGllcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5pbmRleFNpZ25hdHVyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuaW5kZXhTaWduYXR1cmVzID0gSU8uaW5kZXhTaWduYXR1cmVzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLmRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmRlc2NyaXB0aW9uID0gSU8uZGVzY3JpcHRpb247XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ubWV0aG9kcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5tZXRob2RzID0gSU8ubWV0aG9kcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoSU8uZXh0ZW5kcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5leHRlbmRzID0gSU8uZXh0ZW5kcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoSU8uaW1wbGVtZW50cyAmJiBJTy5pbXBsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuaW1wbGVtZW50cyA9IElPLmltcGxlbWVudHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1ZyhkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snY2xhc3NlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRXhwcmVzc2lvblN0YXRlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgYm9vdHN0cmFwTW9kdWxlUmVmZXJlbmNlID0gJ2Jvb3RzdHJhcE1vZHVsZSc7XG4gICAgICAgICAgICAgICAgICAgIC8vRmluZCB0aGUgcm9vdCBtb2R1bGUgd2l0aCBib290c3RyYXBNb2R1bGUgY2FsbFxuICAgICAgICAgICAgICAgICAgICAvLzEuIGZpbmQgYSBzaW1wbGUgY2FsbCA6IHBsYXRmb3JtQnJvd3NlckR5bmFtaWMoKS5ib290c3RyYXBNb2R1bGUoQXBwTW9kdWxlKTtcbiAgICAgICAgICAgICAgICAgICAgLy8yLiBvciBpbnNpZGUgYSBjYWxsIDpcbiAgICAgICAgICAgICAgICAgICAgLy8gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgcGxhdGZvcm1Ccm93c2VyRHluYW1pYygpLmJvb3RzdHJhcE1vZHVsZShBcHBNb2R1bGUpO1xuICAgICAgICAgICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgICAgICAgICAgLy8zLiB3aXRoIGEgY2F0Y2ggOiBwbGF0Zm9ybUJyb3dzZXJEeW5hbWljKCkuYm9vdHN0cmFwTW9kdWxlKEFwcE1vZHVsZSkuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICAgICAgICAgICAgICAvLzQuIHdpdGggcGFyYW1ldGVycyA6IHBsYXRmb3JtQnJvd3NlckR5bmFtaWMoKS5ib290c3RyYXBNb2R1bGUoQXBwTW9kdWxlLCB7fSkuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuICAgICAgICAgICAgICAgICAgICAvL0ZpbmQgcmVjdXNpdmVseSBpbiBleHByZXNzaW9uIG5vZGVzIG9uZSB3aXRoIG5hbWUgJ2Jvb3RzdHJhcE1vZHVsZSdcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJvb3RNb2R1bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHROb2RlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3JjRmlsZS50ZXh0LmluZGV4T2YoYm9vdHN0cmFwTW9kdWxlUmVmZXJlbmNlKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHROb2RlID0gdGhpcy5maW5kRXhwcmVzc2lvbkJ5TmFtZUluRXhwcmVzc2lvbnMobm9kZS5leHByZXNzaW9uLCAnYm9vdHN0cmFwTW9kdWxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5leHByZXNzaW9uICYmIG5vZGUuZXhwcmVzc2lvbi5hcmd1bWVudHMgJiYgbm9kZS5leHByZXNzaW9uLmFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdE5vZGUgPSB0aGlzLmZpbmRFeHByZXNzaW9uQnlOYW1lSW5FeHByZXNzaW9uQXJndW1lbnRzKG5vZGUuZXhwcmVzc2lvbi5hcmd1bWVudHMsICdib290c3RyYXBNb2R1bGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihyZXN1bHROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzdWx0Tm9kZS5hcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2gocmVzdWx0Tm9kZS5hcmd1bWVudHMsIGZ1bmN0aW9uKGFyZ3VtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhcmd1bWVudC50ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdE1vZHVsZSA9IGFyZ3VtZW50LnRleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocm9vdE1vZHVsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSb3V0ZXJQYXJzZXIuc2V0Um9vdE1vZHVsZShyb290TW9kdWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZVN0YXRlbWVudCAmJiAhdGhpcy5pc1ZhcmlhYmxlUm91dGVzKG5vZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmZvcyA9IHRoaXMudmlzaXRWYXJpYWJsZURlY2xhcmF0aW9uKG5vZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGluZm9zLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRlcHMudHlwZSA9IChpbmZvcy50eXBlKSA/IGluZm9zLnR5cGUgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZm9zLmRlZmF1bHRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5kZWZhdWx0VmFsdWUgPSBpbmZvcy5kZWZhdWx0VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZm9zLmluaXRpYWxpemVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmluaXRpYWxpemVyID0gaW5mb3MuaW5pdGlhbGl6ZXI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuanNEb2MgJiYgbm9kZS5qc0RvYy5sZW5ndGggPiAwICYmIG5vZGUuanNEb2NbMF0uY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5kZXNjcmlwdGlvbiA9IG1hcmtlZChub2RlLmpzRG9jWzBdLmNvbW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ21pc2NlbGxhbmVvdXMnXS52YXJpYWJsZXMucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5UeXBlQWxpYXNEZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW5mb3MgPSB0aGlzLnZpc2l0VHlwZURlY2xhcmF0aW9uKG5vZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGluZm9zLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ21pc2NlbGxhbmVvdXMnXS50eXBlcy5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluZm9zID0gdGhpcy52aXNpdEZ1bmN0aW9uRGVjbGFyYXRpb24obm9kZSksXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lID0gaW5mb3MubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMudmlzaXRFbnVtQW5kRnVuY3Rpb25EZWNsYXJhdGlvbkRlc2NyaXB0aW9uKG5vZGUpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZm9zLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuYXJncyA9IGluZm9zLmFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snbWlzY2VsbGFuZW91cyddLmZ1bmN0aW9ucy5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkVudW1EZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW5mb3MgPSB0aGlzLnZpc2l0RW51bURlY2xhcmF0aW9uKG5vZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IG5vZGUubmFtZS50ZXh0O1xuICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkczogaW5mb3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy52aXNpdEVudW1BbmRGdW5jdGlvbkRlY2xhcmF0aW9uRGVzY3JpcHRpb24obm9kZSksXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snbWlzY2VsbGFuZW91cyddLmVudW1lcmF0aW9ucy5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cblxuICAgIH1cbiAgICBwcml2YXRlIGRlYnVnKGRlcHM6IERlcHMpIHtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdmb3VuZCcsIGAke2RlcHMubmFtZX1gKTtcbiAgICAgICAgW1xuICAgICAgICAgICAgJ2ltcG9ydHMnLCAnZXhwb3J0cycsICdkZWNsYXJhdGlvbnMnLCAncHJvdmlkZXJzJywgJ2Jvb3RzdHJhcCdcbiAgICAgICAgXS5mb3JFYWNoKHN5bWJvbHMgPT4ge1xuICAgICAgICAgICAgaWYgKGRlcHNbc3ltYm9sc10gJiYgZGVwc1tzeW1ib2xzXS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCcnLCBgLSAke3N5bWJvbHN9OmApO1xuICAgICAgICAgICAgICAgIGRlcHNbc3ltYm9sc10ubWFwKGkgPT4gaS5uYW1lKS5mb3JFYWNoKGQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJycsIGBcXHQtICR7ZH1gKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzVmFyaWFibGVSb3V0ZXMobm9kZSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgIGlmKCBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMgKSB7XG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gbm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zLmxlbmd0aDtcbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLnR5cGUudHlwZU5hbWUgJiYgbm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLnR5cGUudHlwZU5hbWUudGV4dCA9PT0gJ1JvdXRlcycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbmRFeHByZXNzaW9uQnlOYW1lSW5FeHByZXNzaW9ucyhlbnRyeU5vZGUsIG5hbWUpIHtcbiAgICAgICAgbGV0IHJlc3VsdCxcbiAgICAgICAgICAgIGxvb3AgPSBmdW5jdGlvbihub2RlLCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYobm9kZS5leHByZXNzaW9uICYmICFub2RlLmV4cHJlc3Npb24ubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBsb29wKG5vZGUuZXhwcmVzc2lvbiwgbmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKG5vZGUuZXhwcmVzc2lvbiAmJiBub2RlLmV4cHJlc3Npb24ubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZihub2RlLmV4cHJlc3Npb24ubmFtZS50ZXh0ID09PSBuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBub2RlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9vcChub2RlLmV4cHJlc3Npb24sIG5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBsb29wKGVudHJ5Tm9kZSwgbmFtZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kRXhwcmVzc2lvbkJ5TmFtZUluRXhwcmVzc2lvbkFyZ3VtZW50cyhhcmcsIG5hbWUpIHtcbiAgICAgICAgbGV0IHJlc3VsdCxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSBhcmcubGVuZ3RoLFxuICAgICAgICAgICAgbG9vcCA9IGZ1bmN0aW9uKG5vZGUsIG5hbWUpIHtcbiAgICAgICAgICAgICAgICBpZihub2RlLmJvZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuYm9keS5zdGF0ZW1lbnRzICYmIG5vZGUuYm9keS5zdGF0ZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBqID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZW5nID0gbm9kZS5ib2R5LnN0YXRlbWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChqOyBqPGxlbmc7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoYXQuZmluZEV4cHJlc3Npb25CeU5hbWVJbkV4cHJlc3Npb25zKG5vZGUuYm9keS5zdGF0ZW1lbnRzW2pdLCBuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGxvb3AoYXJnW2ldLCBuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgcGFyc2VEZWNvcmF0b3JzKGRlY29yYXRvcnMsIHR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgIGlmIChkZWNvcmF0b3JzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIF8uZm9yRWFjaChkZWNvcmF0b3JzLCBmdW5jdGlvbihkZWNvcmF0b3IpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSB0eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZGVjb3JhdG9yc1swXS5leHByZXNzaW9uLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZGVjb3JhdG9yc1swXS5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNDb21wb25lbnQobWV0YWRhdGFzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVjb3JhdG9ycyhtZXRhZGF0YXMsICdDb21wb25lbnQnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzUGlwZShtZXRhZGF0YXMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWNvcmF0b3JzKG1ldGFkYXRhcywgJ1BpcGUnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzRGlyZWN0aXZlKG1ldGFkYXRhcykge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlY29yYXRvcnMobWV0YWRhdGFzLCAnRGlyZWN0aXZlJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0luamVjdGFibGUobWV0YWRhdGFzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVjb3JhdG9ycyhtZXRhZGF0YXMsICdJbmplY3RhYmxlJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc01vZHVsZShtZXRhZGF0YXMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWNvcmF0b3JzKG1ldGFkYXRhcywgJ05nTW9kdWxlJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRUeXBlKG5hbWUpIHtcbiAgICAgICAgbGV0IHR5cGU7XG4gICAgICAgIGlmKCBuYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignY29tcG9uZW50JykgIT09IC0xICkge1xuICAgICAgICAgICAgdHlwZSA9ICdjb21wb25lbnQnO1xuICAgICAgICB9IGVsc2UgaWYoIG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdwaXBlJykgIT09IC0xICkge1xuICAgICAgICAgICAgdHlwZSA9ICdwaXBlJztcbiAgICAgICAgfSBlbHNlIGlmKCBuYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignbW9kdWxlJykgIT09IC0xICkge1xuICAgICAgICAgICAgdHlwZSA9ICdtb2R1bGUnO1xuICAgICAgICB9IGVsc2UgaWYoIG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdkaXJlY3RpdmUnKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICB0eXBlID0gJ2RpcmVjdGl2ZSc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHR5cGU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTeW1ib2xlTmFtZShub2RlKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIG5vZGUubmFtZS50ZXh0O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50U2VsZWN0b3IocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdzZWxlY3RvcicpLnBvcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50RXhwb3J0QXMocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdleHBvcnRBcycpLnBvcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TW9kdWxlUHJvdmlkZXJzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAncHJvdmlkZXJzJykubWFwKChwcm92aWRlck5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKHByb3ZpZGVyTmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZFByb3BzKHZpc2l0ZWROb2RlKSB7XG4gICAgICAgIGlmKHZpc2l0ZWROb2RlLmV4cHJlc3Npb24uYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB2aXNpdGVkTm9kZS5leHByZXNzaW9uLmFyZ3VtZW50cy5wb3AoKS5wcm9wZXJ0aWVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVEZWNsYXRpb25zKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnZGVjbGFyYXRpb25zJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICBsZXQgY29tcG9uZW50ID0gdGhpcy5maW5kQ29tcG9uZW50U2VsZWN0b3JCeU5hbWUobmFtZSk7XG5cbiAgICAgICAgICAgIGlmIChjb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVJbXBvcnRzUmF3KHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzUmF3KHByb3BzLCAnaW1wb3J0cycpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TW9kdWxlSW1wb3J0cyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2ltcG9ydHMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE1vZHVsZUV4cG9ydHMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdleHBvcnRzJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRIb3N0KHByb3BzOiBOb2RlT2JqZWN0W10pOiBPYmplY3Qge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzT2JqZWN0KHByb3BzLCAnaG9zdCcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TW9kdWxlQm9vdHN0cmFwKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnYm9vdHN0cmFwJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRJbnB1dHNNZXRhZGF0YShwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnaW5wdXRzJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXREZWNvcmF0b3JPZlR5cGUobm9kZSwgZGVjb3JhdG9yVHlwZSkge1xuICAgICAgdmFyIGRlY29yYXRvcnMgPSBub2RlLmRlY29yYXRvcnMgfHwgW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGVjb3JhdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChkZWNvcmF0b3JzW2ldLmV4cHJlc3Npb24uZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICBpZiAoZGVjb3JhdG9yc1tpXS5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gZGVjb3JhdG9yVHlwZSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlY29yYXRvcnNbaV07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRJbnB1dChwcm9wZXJ0eSwgaW5EZWNvcmF0b3IsIHNvdXJjZUZpbGU/KSB7XG4gICAgICAgIHZhciBpbkFyZ3MgPSBpbkRlY29yYXRvci5leHByZXNzaW9uLmFyZ3VtZW50cyxcbiAgICAgICAgICAgIF9yZXR1cm4gPSB7fTtcbiAgICAgICAgX3JldHVybi5uYW1lID0gKGluQXJncy5sZW5ndGggPiAwKSA/IGluQXJnc1swXS50ZXh0IDogcHJvcGVydHkubmFtZS50ZXh0O1xuICAgICAgICBfcmV0dXJuLmRlZmF1bHRWYWx1ZSA9IHByb3BlcnR5LmluaXRpYWxpemVyID8gdGhpcy5zdHJpbmdpZnlEZWZhdWx0VmFsdWUocHJvcGVydHkuaW5pdGlhbGl6ZXIpIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAocHJvcGVydHkuc3ltYm9sKSB7XG4gICAgICAgICAgICBfcmV0dXJuLmRlc2NyaXB0aW9uID0gbWFya2VkKExpbmtQYXJzZXIucmVzb2x2ZUxpbmtzKHRzLmRpc3BsYXlQYXJ0c1RvU3RyaW5nKHByb3BlcnR5LnN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSkpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFfcmV0dXJuLmRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICBpZiAocHJvcGVydHkuanNEb2MpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkuanNEb2MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHByb3BlcnR5LmpzRG9jWzBdLmNvbW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfcmV0dXJuLmRlc2NyaXB0aW9uID0gbWFya2VkKHByb3BlcnR5LmpzRG9jWzBdLmNvbW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIF9yZXR1cm4ubGluZSA9IHRoaXMuZ2V0UG9zaXRpb24ocHJvcGVydHksIHNvdXJjZUZpbGUpLmxpbmUgKyAxO1xuICAgICAgICBpZiAocHJvcGVydHkudHlwZSkge1xuICAgICAgICAgICAgX3JldHVybi50eXBlID0gdGhpcy52aXNpdFR5cGUocHJvcGVydHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaGFuZGxlIE5ld0V4cHJlc3Npb25cbiAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5pbml0aWFsaXplci5raW5kID09PSB0cy5TeW50YXhLaW5kLk5ld0V4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5LmluaXRpYWxpemVyLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZXR1cm4udHlwZSA9IHByb3BlcnR5LmluaXRpYWxpemVyLmV4cHJlc3Npb24udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3JldHVybjtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0VHlwZShub2RlKSB7XG4gICAgICAgIGxldCBfcmV0dXJuID0gJ3ZvaWQnO1xuICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgaWYgKG5vZGUudHlwZU5hbWUpIHtcbiAgICAgICAgICAgICAgICBfcmV0dXJuID0gbm9kZS50eXBlTmFtZS50ZXh0O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS50eXBlLmtpbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgX3JldHVybiA9IGtpbmRUb1R5cGUobm9kZS50eXBlLmtpbmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm9kZS50eXBlLnR5cGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIF9yZXR1cm4gPSBub2RlLnR5cGUudHlwZU5hbWUudGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUudHlwZS50eXBlQXJndW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIF9yZXR1cm4gKz0gJzwnO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGFyZ3VtZW50IG9mIG5vZGUudHlwZS50eXBlQXJndW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJndW1lbnQua2luZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZXR1cm4gKz0ga2luZFRvVHlwZShhcmd1bWVudC5raW5kKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcmd1bWVudC50eXBlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZXR1cm4gKz0gYXJndW1lbnQudHlwZU5hbWUudGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBfcmV0dXJuICs9ICc+JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUuZWxlbWVudFR5cGUpIHtcbiAgICAgICAgICAgICAgICBfcmV0dXJuID0ga2luZFRvVHlwZShub2RlLmVsZW1lbnRUeXBlLmtpbmQpICsga2luZFRvVHlwZShub2RlLmtpbmQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLnR5cGVzICYmIG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5VbmlvblR5cGUpIHtcbiAgICAgICAgICAgICAgICBfcmV0dXJuID0gJyc7XG4gICAgICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgICAgICBsZW4gPSBub2RlLnR5cGVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmb3IgKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgX3JldHVybiArPSBraW5kVG9UeXBlKG5vZGUudHlwZXNbaV0ua2luZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpPGxlbi0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfcmV0dXJuICs9ICd8JztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS5kb3REb3REb3RUb2tlbikge1xuICAgICAgICAgICAgICAgIF9yZXR1cm4gPSAnYW55W10nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfcmV0dXJuID0ga2luZFRvVHlwZShub2RlLmtpbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vZGUudHlwZUFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgIF9yZXR1cm4gKz0gJzwnO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYXJndW1lbnQgb2Ygbm9kZS50eXBlQXJndW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIF9yZXR1cm4gKz0ga2luZFRvVHlwZShhcmd1bWVudC5raW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgX3JldHVybiArPSAnPic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZXR1cm47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdE91dHB1dChwcm9wZXJ0eSwgb3V0RGVjb3JhdG9yLCBzb3VyY2VGaWxlPykge1xuICAgICAgICB2YXIgaW5BcmdzID0gb3V0RGVjb3JhdG9yLmV4cHJlc3Npb24uYXJndW1lbnRzLFxuICAgICAgICAgICAgX3JldHVybiA9IHt9O1xuICAgICAgICBfcmV0dXJuLm5hbWUgPSAoaW5BcmdzLmxlbmd0aCA+IDApID8gaW5BcmdzWzBdLnRleHQgOiBwcm9wZXJ0eS5uYW1lLnRleHQ7XG4gICAgICAgIF9yZXR1cm4uZGVmYXVsdFZhbHVlID0gcHJvcGVydHkuaW5pdGlhbGl6ZXIgPyB0aGlzLnN0cmluZ2lmeURlZmF1bHRWYWx1ZShwcm9wZXJ0eS5pbml0aWFsaXplcikgOiB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChwcm9wZXJ0eS5zeW1ib2wpIHtcbiAgICAgICAgICAgIF9yZXR1cm4uZGVzY3JpcHRpb24gPSBtYXJrZWQoTGlua1BhcnNlci5yZXNvbHZlTGlua3ModHMuZGlzcGxheVBhcnRzVG9TdHJpbmcocHJvcGVydHkuc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV9yZXR1cm4uZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5qc0RvYykge1xuICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5qc0RvYy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcGVydHkuanNEb2NbMF0uY29tbWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZXR1cm4uZGVzY3JpcHRpb24gPSBtYXJrZWQocHJvcGVydHkuanNEb2NbMF0uY29tbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgX3JldHVybi5saW5lID0gdGhpcy5nZXRQb3NpdGlvbihwcm9wZXJ0eSwgc291cmNlRmlsZSkubGluZSArIDE7XG5cbiAgICAgICAgaWYgKHByb3BlcnR5LnR5cGUpIHtcbiAgICAgICAgICAgIF9yZXR1cm4udHlwZSA9IHRoaXMudmlzaXRUeXBlKHByb3BlcnR5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGhhbmRsZSBOZXdFeHByZXNzaW9uXG4gICAgICAgICAgICBpZiAocHJvcGVydHkuaW5pdGlhbGl6ZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkuaW5pdGlhbGl6ZXIua2luZCA9PT0gdHMuU3ludGF4S2luZC5OZXdFeHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5pbml0aWFsaXplci5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfcmV0dXJuLnR5cGUgPSBwcm9wZXJ0eS5pbml0aWFsaXplci5leHByZXNzaW9uLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZXR1cm47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1B1YmxpYyhtZW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKG1lbWJlci5tb2RpZmllcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGlzUHVibGljOiBib29sZWFuID0gbWVtYmVyLm1vZGlmaWVycy5zb21lKGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGlmaWVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHVibGljS2V5d29yZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGlzUHVibGljKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaXNIaWRkZW5NZW1iZXIobWVtYmVyKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzUHJpdmF0ZShtZW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKG1lbWJlci5tb2RpZmllcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGlzUHJpdmF0ZTogYm9vbGVhbiA9IG1lbWJlci5tb2RpZmllcnMuc29tZShtb2RpZmllciA9PiBtb2RpZmllci5raW5kID09PSB0cy5TeW50YXhLaW5kLlByaXZhdGVLZXl3b3JkKTtcbiAgICAgICAgICAgIGlmIChpc1ByaXZhdGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5pc0hpZGRlbk1lbWJlcihtZW1iZXIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNJbnRlcm5hbChtZW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgaW50ZXJuYWxUYWdzOiBzdHJpbmdbXSA9IFsnaW50ZXJuYWwnXTtcbiAgICAgICAgaWYgKG1lbWJlci5qc0RvYykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgbWVtYmVyLmpzRG9jKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvYy50YWdzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdGFnIG9mIGRvYy50YWdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxUYWdzLmluZGV4T2YodGFnLnRhZ05hbWUudGV4dCkgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzSGlkZGVuTWVtYmVyKG1lbWJlcik6IGJvb2xlYW4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBpbnRlcm5hbFRhZ3M6IHN0cmluZ1tdID0gWydoaWRkZW4nXTtcbiAgICAgICAgaWYgKG1lbWJlci5qc0RvYykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgbWVtYmVyLmpzRG9jKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvYy50YWdzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdGFnIG9mIGRvYy50YWdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxUYWdzLmluZGV4T2YodGFnLnRhZ05hbWUudGV4dCkgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzQW5ndWxhckxpZmVjeWNsZUhvb2sobWV0aG9kTmFtZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBBTkdVTEFSX0xJRkVDWUNMRV9NRVRIT0RTID0gW1xuICAgICAgICAgICAgJ25nT25Jbml0JywgJ25nT25DaGFuZ2VzJywgJ25nRG9DaGVjaycsICduZ09uRGVzdHJveScsICduZ0FmdGVyQ29udGVudEluaXQnLCAnbmdBZnRlckNvbnRlbnRDaGVja2VkJyxcbiAgICAgICAgICAgICduZ0FmdGVyVmlld0luaXQnLCAnbmdBZnRlclZpZXdDaGVja2VkJywgJ3dyaXRlVmFsdWUnLCAncmVnaXN0ZXJPbkNoYW5nZScsICdyZWdpc3Rlck9uVG91Y2hlZCcsICdzZXREaXNhYmxlZFN0YXRlJ1xuICAgICAgICBdO1xuICAgICAgICByZXR1cm4gQU5HVUxBUl9MSUZFQ1lDTEVfTUVUSE9EUy5pbmRleE9mKG1ldGhvZE5hbWUpID49IDA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdENvbnN0cnVjdG9yRGVjbGFyYXRpb24obWV0aG9kLCBzb3VyY2VGaWxlPykge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgbmFtZTogJ2NvbnN0cnVjdG9yJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgICAgICAgIGFyZ3M6IG1ldGhvZC5wYXJhbWV0ZXJzID8gbWV0aG9kLnBhcmFtZXRlcnMubWFwKChwcm9wKSA9PiB0aGlzLnZpc2l0QXJndW1lbnQocHJvcCkpIDogW10sXG4gICAgICAgICAgICBsaW5lOiB0aGlzLmdldFBvc2l0aW9uKG1ldGhvZCwgc291cmNlRmlsZSkubGluZSArIDFcbiAgICAgICAgfSxcbiAgICAgICAgICAgIGpzZG9jdGFncyA9IEpTRG9jVGFnc1BhcnNlci5nZXRKU0RvY3MobWV0aG9kKSxcblxuXG5cbiAgICAgICAgaWYgKG1ldGhvZC5zeW1ib2wpIHtcbiAgICAgICAgICAgIHJlc3VsdC5kZXNjcmlwdGlvbiA9IG1hcmtlZChMaW5rUGFyc2VyLnJlc29sdmVMaW5rcyh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhtZXRob2Quc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWV0aG9kLm1vZGlmaWVycykge1xuICAgICAgICAgICAgaWYgKG1ldGhvZC5tb2RpZmllcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5tb2RpZmllcktpbmQgPSBtZXRob2QubW9kaWZpZXJzWzBdLmtpbmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGpzZG9jdGFncyAmJiBqc2RvY3RhZ3MubGVuZ3RoID49IDEpIHtcbiAgICAgICAgICAgIGlmIChqc2RvY3RhZ3NbMF0udGFncykge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5qc2RvY3RhZ3MgPSBtYXJrZWR0YWdzKGpzZG9jdGFnc1swXS50YWdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRDb25zdHJ1Y3RvclByb3BlcnRpZXMobWV0aG9kKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgaWYgKG1ldGhvZC5wYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgICB2YXIgX3BhcmFtZXRlcnMgPSBbXSxcbiAgICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBtZXRob2QucGFyYW1ldGVycy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IoaTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQuaXNQdWJsaWMobWV0aG9kLnBhcmFtZXRlcnNbaV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIF9wYXJhbWV0ZXJzLnB1c2godGhhdC52aXNpdEFyZ3VtZW50KG1ldGhvZC5wYXJhbWV0ZXJzW2ldKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9wYXJhbWV0ZXJzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdENhbGxEZWNsYXJhdGlvbihtZXRob2QsIHNvdXJjZUZpbGUpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtYXJrZWQoTGlua1BhcnNlci5yZXNvbHZlTGlua3ModHMuZGlzcGxheVBhcnRzVG9TdHJpbmcobWV0aG9kLnN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSkpLFxuICAgICAgICAgICAgYXJnczogbWV0aG9kLnBhcmFtZXRlcnMgPyBtZXRob2QucGFyYW1ldGVycy5tYXAoKHByb3ApID0+IHRoaXMudmlzaXRBcmd1bWVudChwcm9wKSkgOiBbXSxcbiAgICAgICAgICAgIHJldHVyblR5cGU6IHRoaXMudmlzaXRUeXBlKG1ldGhvZC50eXBlKSxcbiAgICAgICAgICAgIGxpbmU6IHRoaXMuZ2V0UG9zaXRpb24obWV0aG9kLCBzb3VyY2VGaWxlKS5saW5lICsgMVxuICAgICAgICB9LFxuICAgICAgICBqc2RvY3RhZ3MgPSBKU0RvY1RhZ3NQYXJzZXIuZ2V0SlNEb2NzKG1ldGhvZCk7XG4gICAgICAgIGlmIChqc2RvY3RhZ3MgJiYganNkb2N0YWdzLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgICAgICBpZiAoanNkb2N0YWdzWzBdLnRhZ3MpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuanNkb2N0YWdzID0gbWFya2VkdGFncyhqc2RvY3RhZ3NbMF0udGFncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0SW5kZXhEZWNsYXJhdGlvbihtZXRob2QsIHNvdXJjZUZpbGU/KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogbWFya2VkKExpbmtQYXJzZXIucmVzb2x2ZUxpbmtzKHRzLmRpc3BsYXlQYXJ0c1RvU3RyaW5nKG1ldGhvZC5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpKSxcbiAgICAgICAgICAgIGFyZ3M6IG1ldGhvZC5wYXJhbWV0ZXJzID8gbWV0aG9kLnBhcmFtZXRlcnMubWFwKChwcm9wKSA9PiB0aGlzLnZpc2l0QXJndW1lbnQocHJvcCkpIDogW10sXG4gICAgICAgICAgICByZXR1cm5UeXBlOiB0aGlzLnZpc2l0VHlwZShtZXRob2QudHlwZSksXG4gICAgICAgICAgICBsaW5lOiB0aGlzLmdldFBvc2l0aW9uKG1ldGhvZCwgc291cmNlRmlsZSkubGluZSArIDFcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UG9zaXRpb24obm9kZSwgc291cmNlRmlsZSk6IHRzLkxpbmVBbmRDaGFyYWN0ZXIge1xuICAgICAgICB2YXIgcG9zaXRpb246dHMuTGluZUFuZENoYXJhY3RlcjtcbiAgICAgICAgaWYgKG5vZGVbJ25hbWUnXSAmJiBub2RlWyduYW1lJ10uZW5kKSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IHRzLmdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uKHNvdXJjZUZpbGUsIG5vZGVbJ25hbWUnXS5lbmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9zaXRpb24gPSB0cy5nZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbihzb3VyY2VGaWxlLCBub2RlLnBvcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRNZXRob2REZWNsYXJhdGlvbihtZXRob2QsIHNvdXJjZUZpbGUpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIG5hbWU6IG1ldGhvZC5uYW1lLnRleHQsXG4gICAgICAgICAgICBhcmdzOiBtZXRob2QucGFyYW1ldGVycyA/IG1ldGhvZC5wYXJhbWV0ZXJzLm1hcCgocHJvcCkgPT4gdGhpcy52aXNpdEFyZ3VtZW50KHByb3ApKSA6IFtdLFxuICAgICAgICAgICAgcmV0dXJuVHlwZTogdGhpcy52aXNpdFR5cGUobWV0aG9kLnR5cGUpLFxuICAgICAgICAgICAgbGluZTogdGhpcy5nZXRQb3NpdGlvbihtZXRob2QsIHNvdXJjZUZpbGUpLmxpbmUgKyAxXG4gICAgICAgIH0sXG4gICAgICAgICAgICBqc2RvY3RhZ3MgPSBKU0RvY1RhZ3NQYXJzZXIuZ2V0SlNEb2NzKG1ldGhvZCk7XG5cbiAgICAgICAgaWYgKG1ldGhvZC5zeW1ib2wpIHtcbiAgICAgICAgICAgIHJlc3VsdC5kZXNjcmlwdGlvbiA9IG1hcmtlZChMaW5rUGFyc2VyLnJlc29sdmVMaW5rcyh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhtZXRob2Quc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWV0aG9kLmRlY29yYXRvcnMpIHtcbiAgICAgICAgICAgIHJlc3VsdC5kZWNvcmF0b3JzID0gdGhpcy5mb3JtYXREZWNvcmF0b3JzKG1ldGhvZC5kZWNvcmF0b3JzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZXRob2QubW9kaWZpZXJzKSB7XG4gICAgICAgICAgICBpZiAobWV0aG9kLm1vZGlmaWVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0Lm1vZGlmaWVyS2luZCA9IG1ldGhvZC5tb2RpZmllcnNbMF0ua2luZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoanNkb2N0YWdzICYmIGpzZG9jdGFncy5sZW5ndGggPj0gMSkge1xuICAgICAgICAgICAgaWYgKGpzZG9jdGFnc1swXS50YWdzKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LmpzZG9jdGFncyA9IG1hcmtlZHRhZ3MoanNkb2N0YWdzWzBdLnRhZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdEFyZ3VtZW50KGFyZykge1xuICAgICAgICBsZXQgX3Jlc3VsdCA9IHtcbiAgICAgICAgICAgIG5hbWU6IGFyZy5uYW1lLnRleHQsXG4gICAgICAgICAgICB0eXBlOiB0aGlzLnZpc2l0VHlwZShhcmcpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFyZy5kb3REb3REb3RUb2tlbikge1xuICAgICAgICAgICAgX3Jlc3VsdC5kb3REb3REb3RUb2tlbiA9IHRydWVcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3Jlc3VsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE5hbWVzQ29tcGFyZUZuKG5hbWUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgbmFtZSA9IG5hbWUgfHwgJ25hbWUnO1xuICAgICAgICB2YXIgdCA9IChhLCBiKSA9PiB7XG4gICAgICAgICAgICBpZiAoYVtuYW1lXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhW25hbWVdLmxvY2FsZUNvbXBhcmUoYltuYW1lXSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0O1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RyaW5naWZ5RGVmYXVsdFZhbHVlKG5vZGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKG5vZGUudGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUudGV4dDtcbiAgICAgICAgfSBlbHNlIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRmFsc2VLZXl3b3JkKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2ZhbHNlJztcbiAgICAgICAgfSBlbHNlIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVHJ1ZUtleXdvcmQpIHtcbiAgICAgICAgICAgIHJldHVybiAndHJ1ZSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGZvcm1hdERlY29yYXRvcnMoZGVjb3JhdG9ycykge1xuICAgICAgICBsZXQgX2RlY29yYXRvcnMgPSBbXTtcblxuICAgICAgICBfLmZvckVhY2goZGVjb3JhdG9ycywgKGRlY29yYXRvcikgPT4ge1xuICAgICAgICAgICAgaWYgKGRlY29yYXRvci5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRlY29yYXRvci5leHByZXNzaW9uLnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgX2RlY29yYXRvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBkZWNvcmF0b3IuZXhwcmVzc2lvbi50ZXh0XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLmFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24uYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLmFyZ3MgPSBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLmFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBfZGVjb3JhdG9ycy5wdXNoKGluZm8pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIF9kZWNvcmF0b3JzO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRQcm9wZXJ0eShwcm9wZXJ0eSwgc291cmNlRmlsZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICBuYW1lOiBwcm9wZXJ0eS5uYW1lLnRleHQsXG4gICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBwcm9wZXJ0eS5pbml0aWFsaXplciA/IHRoaXMuc3RyaW5naWZ5RGVmYXVsdFZhbHVlKHByb3BlcnR5LmluaXRpYWxpemVyKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICB0eXBlOiB0aGlzLnZpc2l0VHlwZShwcm9wZXJ0eSksXG4gICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgICAgICAgIGxpbmU6IHRoaXMuZ2V0UG9zaXRpb24ocHJvcGVydHksIHNvdXJjZUZpbGUpLmxpbmUgKyAxXG4gICAgICAgICB9LFxuICAgICAgICAgICAganNkb2N0YWdzID0gSlNEb2NUYWdzUGFyc2VyLmdldEpTRG9jcyhwcm9wZXJ0eSk7XG5cbiAgICAgICAgIGlmIChwcm9wZXJ0eS5zeW1ib2wpIHtcbiAgICAgICAgICAgICByZXN1bHQuZGVzY3JpcHRpb24gPSBtYXJrZWQoTGlua1BhcnNlci5yZXNvbHZlTGlua3ModHMuZGlzcGxheVBhcnRzVG9TdHJpbmcocHJvcGVydHkuc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKSk7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGlmIChwcm9wZXJ0eS5kZWNvcmF0b3JzKSB7XG4gICAgICAgICAgICAgcmVzdWx0LmRlY29yYXRvcnMgPSB0aGlzLmZvcm1hdERlY29yYXRvcnMocHJvcGVydHkuZGVjb3JhdG9ycyk7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGlmIChwcm9wZXJ0eS5tb2RpZmllcnMpIHtcbiAgICAgICAgICAgICBpZiAocHJvcGVydHkubW9kaWZpZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgcmVzdWx0Lm1vZGlmaWVyS2luZCA9IHByb3BlcnR5Lm1vZGlmaWVyc1swXS5raW5kO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgIH1cbiAgICAgICAgIGlmIChqc2RvY3RhZ3MgJiYganNkb2N0YWdzLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgICAgICAgaWYgKGpzZG9jdGFnc1swXS50YWdzKSB7XG4gICAgICAgICAgICAgICAgIHJlc3VsdC5qc2RvY3RhZ3MgPSBtYXJrZWR0YWdzKGpzZG9jdGFnc1swXS50YWdzKTtcbiAgICAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRNZW1iZXJzKG1lbWJlcnMsIHNvdXJjZUZpbGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGlucHV0cyA9IFtdLFxuICAgICAgICAgICAgb3V0cHV0cyA9IFtdLFxuICAgICAgICAgICAgbWV0aG9kcyA9IFtdLFxuICAgICAgICAgICAgcHJvcGVydGllcyA9IFtdLFxuICAgICAgICAgICAgaW5kZXhTaWduYXR1cmVzID0gW10sXG4gICAgICAgICAgICBraW5kLFxuICAgICAgICAgICAgaW5wdXREZWNvcmF0b3IsXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcixcbiAgICAgICAgICAgIG91dERlY29yYXRvcjtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1lbWJlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlucHV0RGVjb3JhdG9yID0gdGhpcy5nZXREZWNvcmF0b3JPZlR5cGUobWVtYmVyc1tpXSwgJ0lucHV0Jyk7XG4gICAgICAgICAgICBvdXREZWNvcmF0b3IgPSB0aGlzLmdldERlY29yYXRvck9mVHlwZShtZW1iZXJzW2ldLCAnT3V0cHV0Jyk7XG5cbiAgICAgICAgICAgIGtpbmQgPSBtZW1iZXJzW2ldLmtpbmQ7XG5cbiAgICAgICAgICAgIGlmIChpbnB1dERlY29yYXRvcikge1xuICAgICAgICAgICAgICAgIGlucHV0cy5wdXNoKHRoaXMudmlzaXRJbnB1dChtZW1iZXJzW2ldLCBpbnB1dERlY29yYXRvciwgc291cmNlRmlsZSkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvdXREZWNvcmF0b3IpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXRzLnB1c2godGhpcy52aXNpdE91dHB1dChtZW1iZXJzW2ldLCBvdXREZWNvcmF0b3IsIHNvdXJjZUZpbGUpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNIaWRkZW5NZW1iZXIobWVtYmVyc1tpXSkpIHtcblxuICAgICAgICAgICAgICAgIGlmICggKHRoaXMuaXNQcml2YXRlKG1lbWJlcnNbaV0pIHx8IHRoaXMuaXNJbnRlcm5hbChtZW1iZXJzW2ldKSkgJiYgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpc2FibGVQcml2YXRlT3JJbnRlcm5hbFN1cHBvcnQpIHt9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5NZXRob2REZWNsYXJhdGlvbiB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLk1ldGhvZFNpZ25hdHVyZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHMucHVzaCh0aGlzLnZpc2l0TWV0aG9kRGVjbGFyYXRpb24obWVtYmVyc1tpXSwgc291cmNlRmlsZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5RGVjbGFyYXRpb24gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcm9wZXJ0eVNpZ25hdHVyZSB8fCBtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuR2V0QWNjZXNzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXMucHVzaCh0aGlzLnZpc2l0UHJvcGVydHkobWVtYmVyc1tpXSwgc291cmNlRmlsZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5DYWxsU2lnbmF0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnB1c2godGhpcy52aXNpdENhbGxEZWNsYXJhdGlvbihtZW1iZXJzW2ldLCBzb3VyY2VGaWxlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLkluZGV4U2lnbmF0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleFNpZ25hdHVyZXMucHVzaCh0aGlzLnZpc2l0SW5kZXhEZWNsYXJhdGlvbihtZW1iZXJzW2ldLCBzb3VyY2VGaWxlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLkNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgX2NvbnN0cnVjdG9yUHJvcGVydGllcyA9IHRoaXMudmlzaXRDb25zdHJ1Y3RvclByb3BlcnRpZXMobWVtYmVyc1tpXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaiA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuID0gX2NvbnN0cnVjdG9yUHJvcGVydGllcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IoajsgajxsZW47IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXMucHVzaChfY29uc3RydWN0b3JQcm9wZXJ0aWVzW2pdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yID0gdGhpcy52aXNpdENvbnN0cnVjdG9yRGVjbGFyYXRpb24obWVtYmVyc1tpXSwgc291cmNlRmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpbnB1dHMuc29ydCh0aGlzLmdldE5hbWVzQ29tcGFyZUZuKCkpO1xuICAgICAgICBvdXRwdXRzLnNvcnQodGhpcy5nZXROYW1lc0NvbXBhcmVGbigpKTtcbiAgICAgICAgcHJvcGVydGllcy5zb3J0KHRoaXMuZ2V0TmFtZXNDb21wYXJlRm4oKSk7XG4gICAgICAgIGluZGV4U2lnbmF0dXJlcy5zb3J0KHRoaXMuZ2V0TmFtZXNDb21wYXJlRm4oKSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlucHV0cyxcbiAgICAgICAgICAgIG91dHB1dHMsXG4gICAgICAgICAgICBtZXRob2RzLFxuICAgICAgICAgICAgcHJvcGVydGllcyxcbiAgICAgICAgICAgIGluZGV4U2lnbmF0dXJlcyxcbiAgICAgICAgICAgIGtpbmQsXG4gICAgICAgICAgICBjb25zdHJ1Y3RvclxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXREaXJlY3RpdmVEZWNvcmF0b3IoZGVjb3JhdG9yKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciBzZWxlY3RvcjtcbiAgICAgICAgdmFyIGV4cG9ydEFzO1xuICAgICAgICB2YXIgcHJvcGVydGllcztcblxuICAgICAgICBpZiAoZGVjb3JhdG9yLmV4cHJlc3Npb24uYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHByb3BlcnRpZXMgPSBkZWNvcmF0b3IuZXhwcmVzc2lvbi5hcmd1bWVudHNbMF0ucHJvcGVydGllcztcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByb3BlcnRpZXNbaV0ubmFtZS50ZXh0ID09PSAnc2VsZWN0b3InKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IHRoaXMgd2lsbCBvbmx5IHdvcmsgaWYgc2VsZWN0b3IgaXMgaW5pdGlhbGl6ZWQgYXMgYSBzdHJpbmcgbGl0ZXJhbFxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9IHByb3BlcnRpZXNbaV0uaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHByb3BlcnRpZXNbaV0ubmFtZS50ZXh0ID09PSAnZXhwb3J0QXMnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IHRoaXMgd2lsbCBvbmx5IHdvcmsgaWYgc2VsZWN0b3IgaXMgaW5pdGlhbGl6ZWQgYXMgYSBzdHJpbmcgbGl0ZXJhbFxuICAgICAgICAgICAgICAgICAgICBleHBvcnRBcyA9IHByb3BlcnRpZXNbaV0uaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2VsZWN0b3IsXG4gICAgICAgICAgICBleHBvcnRBc1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNQaXBlRGVjb3JhdG9yKGRlY29yYXRvcikge1xuICAgICAgICByZXR1cm4gKGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24pID8gZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSAnUGlwZScgOiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzTW9kdWxlRGVjb3JhdG9yKGRlY29yYXRvcikge1xuICAgICAgICByZXR1cm4gKGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24pID8gZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSAnTmdNb2R1bGUnIDogZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0RpcmVjdGl2ZURlY29yYXRvcihkZWNvcmF0b3IpIHtcbiAgICAgICAgaWYgKGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgIHZhciBkZWNvcmF0b3JJZGVudGlmaWVyVGV4dCA9IGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dDtcbiAgICAgICAgICAgIHJldHVybiBkZWNvcmF0b3JJZGVudGlmaWVyVGV4dCA9PT0gJ0RpcmVjdGl2ZScgfHwgZGVjb3JhdG9ySWRlbnRpZmllclRleHQgPT09ICdDb21wb25lbnQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1NlcnZpY2VEZWNvcmF0b3IoZGVjb3JhdG9yKSB7XG4gICAgICAgIHJldHVybiAoZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbikgPyBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdJbmplY3RhYmxlJyA6IGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRDbGFzc0RlY2xhcmF0aW9uKGZpbGVOYW1lLCBjbGFzc0RlY2xhcmF0aW9uLCBzb3VyY2VGaWxlPykge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgc3ltYm9sID0gdGhpcy50eXBlQ2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKGNsYXNzRGVjbGFyYXRpb24ubmFtZSk7XG4gICAgICAgIHZhciBkZXNjcmlwdGlvbiA9ICcnO1xuICAgICAgICBpZiAoc3ltYm9sKSB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbiA9IG1hcmtlZChMaW5rUGFyc2VyLnJlc29sdmVMaW5rcyh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhzeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY2xhc3NOYW1lID0gY2xhc3NEZWNsYXJhdGlvbi5uYW1lLnRleHQ7XG4gICAgICAgIHZhciBkaXJlY3RpdmVJbmZvO1xuICAgICAgICB2YXIgbWVtYmVycztcbiAgICAgICAgdmFyIGltcGxlbWVudHNFbGVtZW50cyA9IFtdO1xuICAgICAgICB2YXIgZXh0ZW5kc0VsZW1lbnQ7XG4gICAgICAgIHZhciBqc2RvY3RhZ3MgPSBbXTtcblxuICAgICAgICBpZiAodHlwZW9mIHRzLmdldENsYXNzSW1wbGVtZW50c0hlcml0YWdlQ2xhdXNlRWxlbWVudHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB2YXIgaW1wbGVtZW50ZWRUeXBlcyA9IHRzLmdldENsYXNzSW1wbGVtZW50c0hlcml0YWdlQ2xhdXNlRWxlbWVudHMoY2xhc3NEZWNsYXJhdGlvbik7XG4gICAgICAgICAgICBpZiAoaW1wbGVtZW50ZWRUeXBlcykge1xuICAgICAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICAgICAgbGVuID0gaW1wbGVtZW50ZWRUeXBlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltcGxlbWVudGVkVHlwZXNbaV0uZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1wbGVtZW50c0VsZW1lbnRzLnB1c2goaW1wbGVtZW50ZWRUeXBlc1tpXS5leHByZXNzaW9uLnRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0cy5nZXRDbGFzc0V4dGVuZHNIZXJpdGFnZUNsYXVzZUVsZW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB2YXIgZXh0ZW5kc1R5cGVzID0gdHMuZ2V0Q2xhc3NFeHRlbmRzSGVyaXRhZ2VDbGF1c2VFbGVtZW50KGNsYXNzRGVjbGFyYXRpb24pO1xuICAgICAgICAgICAgaWYgKGV4dGVuZHNUeXBlcykge1xuICAgICAgICAgICAgICAgIGlmIChleHRlbmRzVHlwZXMuZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICBleHRlbmRzRWxlbWVudCA9IGV4dGVuZHNUeXBlcy5leHByZXNzaW9uLnRleHRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3ltYm9sKSB7XG4gICAgICAgICAgICBpZiAoc3ltYm9sLnZhbHVlRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBqc2RvY3RhZ3MgPSBKU0RvY1RhZ3NQYXJzZXIuZ2V0SlNEb2NzKHN5bWJvbC52YWx1ZURlY2xhcmF0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNEaXJlY3RpdmVEZWNvcmF0b3IoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzW2ldKSkge1xuICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVJbmZvID0gdGhpcy52aXNpdERpcmVjdGl2ZURlY29yYXRvcihjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnNbaV0pO1xuICAgICAgICAgICAgICAgICAgICBtZW1iZXJzID0gdGhpcy52aXNpdE1lbWJlcnMoY2xhc3NEZWNsYXJhdGlvbi5tZW1iZXJzLCBzb3VyY2VGaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiBtZW1iZXJzLmlucHV0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dHM6IG1lbWJlcnMub3V0cHV0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IG1lbWJlcnMucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IG1lbWJlcnMubWV0aG9kcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4U2lnbmF0dXJlczogbWVtYmVycy5pbmRleFNpZ25hdHVyZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kOiBtZW1iZXJzLmtpbmQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvcjogbWVtYmVycy5jb25zdHJ1Y3RvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzZG9jdGFnczoganNkb2N0YWdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kczogZXh0ZW5kc0VsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbXBsZW1lbnRzOiBpbXBsZW1lbnRzRWxlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNTZXJ2aWNlRGVjb3JhdG9yKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9yc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVycyA9IHRoaXMudmlzaXRNZW1iZXJzKGNsYXNzRGVjbGFyYXRpb24ubWVtYmVycywgc291cmNlRmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IG1lbWJlcnMubWV0aG9kcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4U2lnbmF0dXJlczogbWVtYmVycy5pbmRleFNpZ25hdHVyZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBtZW1iZXJzLnByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kOiBtZW1iZXJzLmtpbmQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvcjogbWVtYmVycy5jb25zdHJ1Y3RvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZHM6IGV4dGVuZHNFbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgaW1wbGVtZW50czogaW1wbGVtZW50c0VsZW1lbnRzXG4gICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1BpcGVEZWNvcmF0b3IoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzW2ldKSB8fCB0aGlzLmlzTW9kdWxlRGVjb3JhdG9yKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9yc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAganNkb2N0YWdzOiBqc2RvY3RhZ3NcbiAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnY3VzdG9tIGRlY29yYXRvcicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChkZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgbWVtYmVycyA9IHRoaXMudmlzaXRNZW1iZXJzKGNsYXNzRGVjbGFyYXRpb24ubWVtYmVycywgc291cmNlRmlsZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIG1ldGhvZHM6IG1lbWJlcnMubWV0aG9kcyxcbiAgICAgICAgICAgICAgICBpbmRleFNpZ25hdHVyZXM6IG1lbWJlcnMuaW5kZXhTaWduYXR1cmVzLFxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IG1lbWJlcnMucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICBraW5kOiBtZW1iZXJzLmtpbmQsXG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3I6IG1lbWJlcnMuY29uc3RydWN0b3IsXG4gICAgICAgICAgICAgICAgZXh0ZW5kczogZXh0ZW5kc0VsZW1lbnQsXG4gICAgICAgICAgICAgICAgaW1wbGVtZW50czogaW1wbGVtZW50c0VsZW1lbnRzXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lbWJlcnMgPSB0aGlzLnZpc2l0TWVtYmVycyhjbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMsIHNvdXJjZUZpbGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgaW5kZXhTaWduYXR1cmVzOiBtZW1iZXJzLmluZGV4U2lnbmF0dXJlcyxcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBtZW1iZXJzLnByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAga2luZDogbWVtYmVycy5raW5kLFxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yOiBtZW1iZXJzLmNvbnN0cnVjdG9yLFxuICAgICAgICAgICAgICAgIGV4dGVuZHM6IGV4dGVuZHNFbGVtZW50LFxuICAgICAgICAgICAgICAgIGltcGxlbWVudHM6IGltcGxlbWVudHNFbGVtZW50c1xuICAgICAgICAgICAgfV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdFR5cGVEZWNsYXJhdGlvbih0eXBlKSB7XG4gICAgICAgIHZhciByZXN1bHQ6YW55ID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6IHR5cGUubmFtZS50ZXh0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAganNkb2N0YWdzID0gSlNEb2NUYWdzUGFyc2VyLmdldEpTRG9jcyh0eXBlKTtcblxuICAgICAgICBpZiAoanNkb2N0YWdzICYmIGpzZG9jdGFncy5sZW5ndGggPj0gMSkge1xuICAgICAgICAgICAgaWYgKGpzZG9jdGFnc1swXS50YWdzKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LmpzZG9jdGFncyA9IG1hcmtlZHRhZ3MoanNkb2N0YWdzWzBdLnRhZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdEZ1bmN0aW9uRGVjbGFyYXRpb24obWV0aG9kKSB7XG4gICAgICAgIGxldCBtYXBUeXBlcyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgOTQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnTnVsbCc7XG4gICAgICAgICAgICAgICAgY2FzZSAxMTg6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnQW55JztcbiAgICAgICAgICAgICAgICBjYXNlIDEyMTpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdCb29sZWFuJztcbiAgICAgICAgICAgICAgICBjYXNlIDEyOTpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdOZXZlcic7XG4gICAgICAgICAgICAgICAgY2FzZSAxMzI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnTnVtYmVyJztcbiAgICAgICAgICAgICAgICBjYXNlIDEzNDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdTdHJpbmcnO1xuICAgICAgICAgICAgICAgIGNhc2UgMTM3OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1VuZGVmaW5lZCc7XG4gICAgICAgICAgICAgICAgY2FzZSAxNTc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnVHlwZVJlZmVyZW5jZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHZpc2l0QXJndW1lbnQgPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQ6IGFueSA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBhcmcubmFtZS50ZXh0XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGFyZy50eXBlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnR5cGUgPSBtYXBUeXBlcyhhcmcudHlwZS5raW5kKTtcbiAgICAgICAgICAgICAgICBpZiAoYXJnLnR5cGUua2luZCA9PT0gMTU3KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vdHJ5IHJlcGxhY2UgVHlwZVJlZmVyZW5jZSB3aXRoIHR5cGVOYW1lXG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmcudHlwZS50eXBlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnR5cGUgPSBhcmcudHlwZS50eXBlTmFtZS50ZXh0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXN1bHQ6YW55ID0ge1xuICAgICAgICAgICAgbmFtZTogbWV0aG9kLm5hbWUudGV4dCxcbiAgICAgICAgICAgIGFyZ3M6IG1ldGhvZC5wYXJhbWV0ZXJzID8gbWV0aG9kLnBhcmFtZXRlcnMubWFwKChwcm9wKSA9PiB2aXNpdEFyZ3VtZW50KHByb3ApKSA6IFtdXG4gICAgICAgIH0sXG4gICAgICAgIGpzZG9jdGFncyA9IEpTRG9jVGFnc1BhcnNlci5nZXRKU0RvY3MobWV0aG9kKTtcblxuICAgICAgICBpZiAodHlwZW9mIG1ldGhvZC50eXBlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmVzdWx0LnJldHVyblR5cGUgPSB0aGlzLnZpc2l0VHlwZShtZXRob2QudHlwZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWV0aG9kLm1vZGlmaWVycykge1xuICAgICAgICAgICAgaWYgKG1ldGhvZC5tb2RpZmllcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5tb2RpZmllcktpbmQgPSBtZXRob2QubW9kaWZpZXJzWzBdLmtpbmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGpzZG9jdGFncyAmJiBqc2RvY3RhZ3MubGVuZ3RoID49IDEpIHtcbiAgICAgICAgICAgIGlmIChqc2RvY3RhZ3NbMF0udGFncykge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5qc2RvY3RhZ3MgPSBtYXJrZWR0YWdzKGpzZG9jdGFnc1swXS50YWdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRWYXJpYWJsZURlY2xhcmF0aW9uKG5vZGUpIHtcbiAgICAgICAgaWYoIG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucyApIHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0ubmFtZS50ZXh0LFxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6IG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS5pbml0aWFsaXplciA/IHRoaXMuc3RyaW5naWZ5RGVmYXVsdFZhbHVlKG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS5pbml0aWFsaXplcikgOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLmluaXRpYWxpemVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5pbml0aWFsaXplciA9IG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS5pbml0aWFsaXplcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnR5cGUgPSB0aGlzLnZpc2l0VHlwZShub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0RnVuY3Rpb25EZWNsYXJhdGlvbkpTRG9jVGFncyhub2RlKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGpzZG9jdGFncyA9IEpTRG9jVGFnc1BhcnNlci5nZXRKU0RvY3Mobm9kZSksXG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIGlmIChqc2RvY3RhZ3MgJiYganNkb2N0YWdzLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgICAgICBpZiAoanNkb2N0YWdzWzBdLnRhZ3MpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBtYXJrZWR0YWdzKGpzZG9jdGFnc1swXS50YWdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRFbnVtQW5kRnVuY3Rpb25EZWNsYXJhdGlvbkRlc2NyaXB0aW9uKG5vZGUpOiBzdHJpbmcge1xuICAgICAgICBsZXQgZGVzY3JpcHRpb246c3RyaW5nID0gJyc7XG4gICAgICAgIGlmIChub2RlLmpzRG9jKSB7XG4gICAgICAgICAgICBpZiAobm9kZS5qc0RvYy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBub2RlLmpzRG9jWzBdLmNvbW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gbWFya2VkKG5vZGUuanNEb2NbMF0uY29tbWVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXNjcmlwdGlvbjtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0RW51bURlY2xhcmF0aW9uKG5vZGUpIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdLFxuICAgICAgICBpZiggbm9kZS5tZW1iZXJzICkge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IG5vZGUubWVtYmVycy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBtZW1iZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG5vZGUubWVtYmVyc1tpXS5uYW1lLnRleHRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubWVtYmVyc1tpXS5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgICAgICBtZW1iZXIudmFsdWUgPSBub2RlLm1lbWJlcnNbaV0uaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobWVtYmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRFbnVtRGVjbGFyYXRpb25Gb3JSb3V0ZXMoZmlsZU5hbWUsIG5vZGUpIHtcbiAgICAgICAgaWYoIG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucyApIHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZihub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBpZihub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZS50eXBlTmFtZSAmJiBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZS50eXBlTmFtZS50ZXh0ID09PSAnUm91dGVzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGEgPSBnZW5lcmF0ZShub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0uaW5pdGlhbGl6ZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICBSb3V0ZXJQYXJzZXIuYWRkUm91dGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS5uYW1lLnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogUm91dGVyUGFyc2VyLmNsZWFuUmF3Um91dGUoZGF0YSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IGZpbGVOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlczogZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Um91dGVJTyhmaWxlbmFtZSwgc291cmNlRmlsZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzID0gc291cmNlRmlsZS5zdGF0ZW1lbnRzLnJlZHVjZSgoZGlyZWN0aXZlLCBzdGF0ZW1lbnQpID0+IHtcblxuICAgICAgICAgICAgaWYgKHN0YXRlbWVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlU3RhdGVtZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZS5jb25jYXQodGhpcy52aXNpdEVudW1EZWNsYXJhdGlvbkZvclJvdXRlcyhmaWxlbmFtZSwgc3RhdGVtZW50KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgIH0sIFtdKVxuXG4gICAgICAgIHJldHVybiByZXNbMF0gfHwge307XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRJTyhmaWxlbmFtZTogc3RyaW5nLCBzb3VyY2VGaWxlLCBub2RlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSBzb3VyY2VGaWxlLnN0YXRlbWVudHMucmVkdWNlKChkaXJlY3RpdmUsIHN0YXRlbWVudCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoc3RhdGVtZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZW1lbnQucG9zID09PSBub2RlLnBvcyAmJiBzdGF0ZW1lbnQuZW5kID09PSBub2RlLmVuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlLmNvbmNhdCh0aGlzLnZpc2l0Q2xhc3NEZWNsYXJhdGlvbihmaWxlbmFtZSwgc3RhdGVtZW50LCBzb3VyY2VGaWxlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICB9LCBbXSlcblxuICAgICAgICByZXR1cm4gcmVzWzBdIHx8IHt9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q2xhc3NJTyhmaWxlbmFtZTogc3RyaW5nLCBzb3VyY2VGaWxlLCBub2RlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSBzb3VyY2VGaWxlLnN0YXRlbWVudHMucmVkdWNlKChkaXJlY3RpdmUsIHN0YXRlbWVudCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoc3RhdGVtZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZW1lbnQucG9zID09PSBub2RlLnBvcyAmJiBzdGF0ZW1lbnQuZW5kID09PSBub2RlLmVuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlLmNvbmNhdCh0aGlzLnZpc2l0Q2xhc3NEZWNsYXJhdGlvbihmaWxlbmFtZSwgc3RhdGVtZW50LCBzb3VyY2VGaWxlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICB9LCBbXSlcblxuICAgICAgICByZXR1cm4gcmVzWzBdIHx8IHt9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0SW50ZXJmYWNlSU8oZmlsZW5hbWU6IHN0cmluZywgc291cmNlRmlsZSwgbm9kZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzID0gc291cmNlRmlsZS5zdGF0ZW1lbnRzLnJlZHVjZSgoZGlyZWN0aXZlLCBzdGF0ZW1lbnQpID0+IHtcblxuICAgICAgICAgICAgaWYgKHN0YXRlbWVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkludGVyZmFjZURlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlbWVudC5wb3MgPT09IG5vZGUucG9zICYmIHN0YXRlbWVudC5lbmQgPT09IG5vZGUuZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmUuY29uY2F0KHRoaXMudmlzaXRDbGFzc0RlY2xhcmF0aW9uKGZpbGVuYW1lLCBzdGF0ZW1lbnQsIHNvdXJjZUZpbGUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgIH0sIFtdKVxuXG4gICAgICAgIHJldHVybiByZXNbMF0gfHwge307XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRPdXRwdXRzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdvdXRwdXRzJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRQcm92aWRlcnMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdwcm92aWRlcnMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFZpZXdQcm92aWRlcnMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICd2aWV3UHJvdmlkZXJzJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnREaXJlY3RpdmVzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnZGlyZWN0aXZlcycpLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICAgICAgaWRlbnRpZmllci5zZWxlY3RvciA9IHRoaXMuZmluZENvbXBvbmVudFNlbGVjdG9yQnlOYW1lKG5hbWUpO1xuICAgICAgICAgICAgaWRlbnRpZmllci5sYWJlbCA9ICcnO1xuICAgICAgICAgICAgcmV0dXJuIGlkZW50aWZpZXI7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50RXhhbXBsZVVybHMgPSBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICB2YXIgZXhhbXBsZVVybHNNYXRjaGVzID0gdGV4dC5tYXRjaCgvPGV4YW1wbGUtdXJsPiguKj8pPFxcL2V4YW1wbGUtdXJsPi9nKTtcbiAgICAgICAgdmFyIGV4YW1wbGVVcmxzID0gbnVsbDtcbiAgICAgICAgaWYgKGV4YW1wbGVVcmxzTWF0Y2hlcyAmJiBleGFtcGxlVXJsc01hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBleGFtcGxlVXJscyA9IGV4YW1wbGVVcmxzTWF0Y2hlcy5tYXAoZnVuY3Rpb24odmFsKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsLnJlcGxhY2UoLzxcXC8/ZXhhbXBsZS11cmw+L2csJycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV4YW1wbGVVcmxzO1xuICAgIH1cblxuICAgIHByaXZhdGUgcGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZTogc3RyaW5nKTogYW55IHtcbiAgICAgICAgbGV0IG5zTW9kdWxlID0gbmFtZS5zcGxpdCgnLicpLFxuICAgICAgICAgICAgdHlwZSA9IHRoaXMuZ2V0VHlwZShuYW1lKTtcbiAgICAgICAgaWYgKG5zTW9kdWxlLmxlbmd0aCA+IDEpIHtcblxuICAgICAgICAgICAgLy8gY2FjaGUgZGVwcyB3aXRoIHRoZSBzYW1lIG5hbWVzcGFjZSAoaS5lIFNoYXJlZC4qKVxuICAgICAgICAgICAgaWYgKHRoaXMuX19uc01vZHVsZVtuc01vZHVsZVswXV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9fbnNNb2R1bGVbbnNNb2R1bGVbMF1dLnB1c2gobmFtZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX19uc01vZHVsZVtuc01vZHVsZVswXV0gPSBbbmFtZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbnM6IG5zTW9kdWxlWzBdLFxuICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgdHlwZTogdHlwZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgdHlwZTogdHlwZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50VGVtcGxhdGVVcmwocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3RlbXBsYXRlVXJsJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRUZW1wbGF0ZShwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IHQgPSB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICd0ZW1wbGF0ZScsIHRydWUpLnBvcCgpXG4gICAgICAgIGlmKHQpIHtcbiAgICAgICAgICAgIHQgPSBkZXRlY3RJbmRlbnQodCwgMCk7XG4gICAgICAgICAgICB0ID0gdC5yZXBsYWNlKC9cXG4vLCAnJyk7XG4gICAgICAgICAgICB0ID0gdC5yZXBsYWNlKC8gKyQvZ20sICcnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFN0eWxlVXJscyhwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5zYW5pdGl6ZVVybHModGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnc3R5bGVVcmxzJykpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50U3R5bGVzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdzdHlsZXMnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudE1vZHVsZUlkKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnbW9kdWxlSWQnKS5wb3AoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudENoYW5nZURldGVjdGlvbihwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2NoYW5nZURldGVjdGlvbicpLnBvcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50RW5jYXBzdWxhdGlvbihwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnZW5jYXBzdWxhdGlvbicpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2FuaXRpemVVcmxzKHVybHM6IHN0cmluZ1tdKSB7XG4gICAgICAgIHJldHVybiB1cmxzLm1hcCh1cmwgPT4gdXJsLnJlcGxhY2UoJy4vJywgJycpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFN5bWJvbERlcHNPYmplY3QocHJvcHM6IE5vZGVPYmplY3RbXSwgdHlwZTogc3RyaW5nLCBtdWx0aUxpbmU/OiBib29sZWFuKTogT2JqZWN0IHtcbiAgICAgICAgbGV0IGRlcHMgPSBwcm9wcy5maWx0ZXIoKG5vZGU6IE5vZGVPYmplY3QpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBub2RlLm5hbWUudGV4dCA9PT0gdHlwZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IHBhcnNlUHJvcGVydGllcyA9IChub2RlOiBOb2RlT2JqZWN0KTogT2JqZWN0ID0+IHtcbiAgICAgICAgICAgIGxldCBvYmogPSB7fTtcbiAgICAgICAgICAgIChub2RlLmluaXRpYWxpemVyLnByb3BlcnRpZXMgfHwgW10pLmZvckVhY2goKHByb3A6IE5vZGVPYmplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBvYmpbcHJvcC5uYW1lLnRleHRdID0gcHJvcC5pbml0aWFsaXplci50ZXh0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBkZXBzLm1hcChwYXJzZVByb3BlcnRpZXMpLnBvcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U3ltYm9sRGVwc1Jhdyhwcm9wczogTm9kZU9iamVjdFtdLCB0eXBlOiBzdHJpbmcsIG11bHRpTGluZT86IGJvb2xlYW4pOiBhbnkge1xuICAgICAgICBsZXQgZGVwcyA9IHByb3BzLmZpbHRlcigobm9kZTogTm9kZU9iamVjdCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUubmFtZS50ZXh0ID09PSB0eXBlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRlcHMgfHwgW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTeW1ib2xEZXBzKHByb3BzOiBOb2RlT2JqZWN0W10sIHR5cGU6IHN0cmluZywgbXVsdGlMaW5lPzogYm9vbGVhbik6IHN0cmluZ1tdIHtcblxuICAgICAgICBsZXQgZGVwcyA9IHByb3BzLmZpbHRlcigobm9kZTogTm9kZU9iamVjdCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUubmFtZS50ZXh0ID09PSB0eXBlO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgcGFyc2VTeW1ib2xUZXh0ID0gKHRleHQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICB0ZXh0XG4gICAgICAgICAgICBdO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBidWlsZElkZW50aWZpZXJOYW1lID0gKG5vZGU6IE5vZGVPYmplY3QsIG5hbWUgPSAnJykgPT4ge1xuXG4gICAgICAgICAgICBpZiAobm9kZS5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWUgPyBgLiR7bmFtZX1gIDogbmFtZTtcblxuICAgICAgICAgICAgICAgIGxldCBub2RlTmFtZSA9IHRoaXMudW5rbm93bjtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gbm9kZS5uYW1lLnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUudGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBub2RlTmFtZSA9IG5vZGUudGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5leHByZXNzaW9uKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuZXhwcmVzc2lvbi50ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlTmFtZSA9IG5vZGUuZXhwcmVzc2lvbi50ZXh0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYobm9kZS5leHByZXNzaW9uLmVsZW1lbnRzKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmV4cHJlc3Npb24ua2luZCA9PT0gdHMuU3ludGF4S2luZC5BcnJheUxpdGVyYWxFeHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWUgPSBub2RlLmV4cHJlc3Npb24uZWxlbWVudHMubWFwKCBlbCA9PiBlbC50ZXh0ICkuam9pbignLCAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlTmFtZSA9IGBbJHtub2RlTmFtZX1dYDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gIHRzLlN5bnRheEtpbmQuU3ByZWFkRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYC4uLiR7bm9kZU5hbWV9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke2J1aWxkSWRlbnRpZmllck5hbWUobm9kZS5leHByZXNzaW9uLCBub2RlTmFtZSl9JHtuYW1lfWBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGAke25vZGUudGV4dH0uJHtuYW1lfWA7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGFyc2VQcm92aWRlckNvbmZpZ3VyYXRpb24gPSAobzogTm9kZU9iamVjdCk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgICAvLyBwYXJzZSBleHByZXNzaW9ucyBzdWNoIGFzOlxuICAgICAgICAgICAgLy8geyBwcm92aWRlOiBBUFBfQkFTRV9IUkVGLCB1c2VWYWx1ZTogJy8nIH0sXG4gICAgICAgICAgICAvLyBvclxuICAgICAgICAgICAgLy8geyBwcm92aWRlOiAnRGF0ZScsIHVzZUZhY3Rvcnk6IChkMSwgZDIpID0+IG5ldyBEYXRlKCksIGRlcHM6IFsnZDEnLCAnZDInXSB9XG5cbiAgICAgICAgICAgIGxldCBfZ2VuUHJvdmlkZXJOYW1lOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgbGV0IF9wcm92aWRlclByb3BzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgICAgICAoby5wcm9wZXJ0aWVzIHx8IFtdKS5mb3JFYWNoKChwcm9wOiBOb2RlT2JqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBsZXQgaWRlbnRpZmllciA9IHByb3AuaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgICAgICBpZiAocHJvcC5pbml0aWFsaXplci5raW5kID09PSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllciA9IGAnJHtpZGVudGlmaWVyfSdgO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGxhbWJkYSBmdW5jdGlvbiAoaS5lIHVzZUZhY3RvcnkpXG4gICAgICAgICAgICAgICAgaWYgKHByb3AuaW5pdGlhbGl6ZXIuYm9keSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcGFyYW1zID0gKHByb3AuaW5pdGlhbGl6ZXIucGFyYW1ldGVycyB8fCA8YW55PltdKS5tYXAoKHBhcmFtczogTm9kZU9iamVjdCkgPT4gcGFyYW1zLm5hbWUudGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXIgPSBgKCR7cGFyYW1zLmpvaW4oJywgJyl9KSA9PiB7fWA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gZmFjdG9yeSBkZXBzIGFycmF5XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocHJvcC5pbml0aWFsaXplci5lbGVtZW50cykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZWxlbWVudHMgPSAocHJvcC5pbml0aWFsaXplci5lbGVtZW50cyB8fCBbXSkubWFwKChuOiBOb2RlT2JqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJyR7bi50ZXh0fSdgO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbi50ZXh0O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllciA9IGBbJHtlbGVtZW50cy5qb2luKCcsICcpfV1gO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIF9wcm92aWRlclByb3BzLnB1c2goW1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGkuZSBwcm92aWRlXG4gICAgICAgICAgICAgICAgICAgIHByb3AubmFtZS50ZXh0LFxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGkuZSBPcGFxdWVUb2tlbiBvciAnU3RyaW5nVG9rZW4nXG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXJcblxuICAgICAgICAgICAgICAgIF0uam9pbignOiAnKSk7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gYHsgJHtfcHJvdmlkZXJQcm9wcy5qb2luKCcsICcpfSB9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYXJzZVN5bWJvbEVsZW1lbnRzID0gKG86IE5vZGVPYmplY3QgfCBhbnkpOiBzdHJpbmcgPT4ge1xuICAgICAgICAgICAgLy8gcGFyc2UgZXhwcmVzc2lvbnMgc3VjaCBhczogQW5ndWxhckZpcmVNb2R1bGUuaW5pdGlhbGl6ZUFwcChmaXJlYmFzZUNvbmZpZylcbiAgICAgICAgICAgIGlmIChvLmFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgIGxldCBjbGFzc05hbWUgPSBidWlsZElkZW50aWZpZXJOYW1lKG8uZXhwcmVzc2lvbik7XG5cbiAgICAgICAgICAgICAgICAvLyBmdW5jdGlvbiBhcmd1bWVudHMgY291bGQgYmUgcmVhbGx5IGNvbXBsZXhlLiBUaGVyZSBhcmUgc29cbiAgICAgICAgICAgICAgICAvLyBtYW55IHVzZSBjYXNlcyB0aGF0IHdlIGNhbid0IGhhbmRsZS4gSnVzdCBwcmludCBcImFyZ3NcIiB0byBpbmRpY2F0ZVxuICAgICAgICAgICAgICAgIC8vIHRoYXQgd2UgaGF2ZSBhcmd1bWVudHMuXG5cbiAgICAgICAgICAgICAgICBsZXQgZnVuY3Rpb25BcmdzID0gby5hcmd1bWVudHMubGVuZ3RoID4gMCA/ICdhcmdzJyA6ICcnO1xuICAgICAgICAgICAgICAgIGxldCB0ZXh0ID0gYCR7Y2xhc3NOYW1lfSgke2Z1bmN0aW9uQXJnc30pYDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gcGFyc2UgZXhwcmVzc2lvbnMgc3VjaCBhczogU2hhcmVkLk1vZHVsZVxuICAgICAgICAgICAgZWxzZSBpZiAoby5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSBidWlsZElkZW50aWZpZXJOYW1lKG8pO1xuICAgICAgICAgICAgICAgIHJldHVybiBpZGVudGlmaWVyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gby50ZXh0ID8gby50ZXh0IDogcGFyc2VQcm92aWRlckNvbmZpZ3VyYXRpb24obyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHBhcnNlU3ltYm9scyA9IChub2RlOiBOb2RlT2JqZWN0KTogc3RyaW5nW10gPT4ge1xuXG4gICAgICAgICAgICBsZXQgdGV4dCA9IG5vZGUuaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgIGlmICh0ZXh0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlU3ltYm9sVGV4dCh0ZXh0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5pbml0aWFsaXplci5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSBwYXJzZVN5bWJvbEVsZW1lbnRzKG5vZGUuaW5pdGlhbGl6ZXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXJcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLmluaXRpYWxpemVyLmVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMubWFwKHBhcnNlU3ltYm9sRWxlbWVudHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBkZXBzLm1hcChwYXJzZVN5bWJvbHMpLnBvcCgpIHx8IFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZENvbXBvbmVudFNlbGVjdG9yQnlOYW1lKG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5fX2NhY2hlW25hbWVdO1xuICAgIH1cblxufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIHByb21pc2VTZXF1ZW50aWFsKHByb21pc2VzKSB7XG5cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocHJvbWlzZXMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZCB0byBiZSBhbiBhcnJheSBvZiBQcm9taXNlcycpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgbGV0IHJlc3VsdHMgPSBbXTtcblxuICAgICAgICBjb25zdCBpdGVyYXRlZUZ1bmMgPSAocHJldmlvdXNQcm9taXNlLCBjdXJyZW50UHJvbWlzZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzUHJvbWlzZVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY291bnQrKyAhPT0gMCkgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50UHJvbWlzZShyZXN1bHQsIHJlc3VsdHMsIGNvdW50KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb21pc2VzID0gcHJvbWlzZXMuY29uY2F0KCgpID0+IFByb21pc2UucmVzb2x2ZSgpKTtcblxuICAgICAgICBwcm9taXNlc1xuICAgICAgICAgICAgLnJlZHVjZShpdGVyYXRlZUZ1bmMsIFByb21pc2UucmVzb2x2ZShmYWxzZSkpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdHMpO1xuICAgICAgICAgICAgfSlcblxuICAgIH0pO1xufTtcbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBMaXZlU2VydmVyIGZyb20gJ2xpdmUtc2VydmVyJztcbmltcG9ydCAqIGFzIFNoZWxsanMgZnJvbSAnc2hlbGxqcyc7XG5cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBIdG1sRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL2h0bWwuZW5naW5lJztcbmltcG9ydCB7IE1hcmtkb3duRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL21hcmtkb3duLmVuZ2luZSc7XG5pbXBvcnQgeyBGaWxlRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL2ZpbGUuZW5naW5lJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb24gfSBmcm9tICcuL2NvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvbkludGVyZmFjZSB9IGZyb20gJy4vaW50ZXJmYWNlcy9jb25maWd1cmF0aW9uLmludGVyZmFjZSc7XG5pbXBvcnQgeyAkZGVwZW5kZW5jaWVzRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL2RlcGVuZGVuY2llcy5lbmdpbmUnO1xuaW1wb3J0IHsgTmdkRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL25nZC5lbmdpbmUnO1xuaW1wb3J0IHsgU2VhcmNoRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL3NlYXJjaC5lbmdpbmUnO1xuaW1wb3J0IHsgRGVwZW5kZW5jaWVzIH0gZnJvbSAnLi9jb21waWxlci9kZXBlbmRlbmNpZXMnO1xuaW1wb3J0IHsgUm91dGVyUGFyc2VyIH0gZnJvbSAnLi4vdXRpbHMvcm91dGVyLnBhcnNlcic7XG5cbmltcG9ydCB7IENPTVBPRE9DX0RFRkFVTFRTIH0gZnJvbSAnLi4vdXRpbHMvZGVmYXVsdHMnO1xuXG5pbXBvcnQgeyBnZXRBbmd1bGFyVmVyc2lvbk9mUHJvamVjdCB9IGZyb20gJy4uL3V0aWxzL2FuZ3VsYXItdmVyc2lvbic7XG5cbmltcG9ydCB7IGNsZWFuTmFtZVdpdGhvdXRTcGFjZUFuZFRvTG93ZXJDYXNlLCBmaW5kTWFpblNvdXJjZUZvbGRlciB9IGZyb20gJy4uL3V0aWxpdGllcyc7XG5cbmltcG9ydCB7IHByb21pc2VTZXF1ZW50aWFsIH0gZnJvbSAnLi4vdXRpbHMvcHJvbWlzZS1zZXF1ZW50aWFsJztcblxuY29uc3QgZ2xvYjogYW55ID0gcmVxdWlyZSgnZ2xvYicpLFxuICAgICAgdHMgPSByZXF1aXJlKCd0eXBlc2NyaXB0JyksXG4gICAgICBfID0gcmVxdWlyZSgnbG9kYXNoJyksXG4gICAgICBtYXJrZWQgPSByZXF1aXJlKCdtYXJrZWQnKSxcbiAgICAgIGNob2tpZGFyID0gcmVxdWlyZSgnY2hva2lkYXInKTtcblxubGV0IHBrZyA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLFxuICAgIGN3ZCA9IHByb2Nlc3MuY3dkKCksXG4gICAgJGh0bWxlbmdpbmUgPSBuZXcgSHRtbEVuZ2luZSgpLFxuICAgICRmaWxlZW5naW5lID0gbmV3IEZpbGVFbmdpbmUoKSxcbiAgICAkbWFya2Rvd25lbmdpbmUgPSBuZXcgTWFya2Rvd25FbmdpbmUoKSxcbiAgICAkbmdkZW5naW5lID0gbmV3IE5nZEVuZ2luZSgpLFxuICAgICRzZWFyY2hFbmdpbmUgPSBuZXcgU2VhcmNoRW5naW5lKCksXG4gICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKVxuXG5leHBvcnQgY2xhc3MgQXBwbGljYXRpb24ge1xuICAgIC8qKlxuICAgICAqIEZpbGVzIHByb2Nlc3NlZCBkdXJpbmcgaW5pdGlhbCBzY2FubmluZ1xuICAgICAqL1xuICAgIGZpbGVzOiBBcnJheTxzdHJpbmc+O1xuICAgIC8qKlxuICAgICAqIEZpbGVzIHByb2Nlc3NlZCBkdXJpbmcgd2F0Y2ggc2Nhbm5pbmdcbiAgICAgKi9cbiAgICB1cGRhdGVkRmlsZXM6IEFycmF5PHN0cmluZz47XG4gICAgLyoqXG4gICAgICogRmlsZXMgY2hhbmdlZCBkdXJpbmcgd2F0Y2ggc2Nhbm5pbmdcbiAgICAgKi9cbiAgICB3YXRjaENoYW5nZWRGaWxlczogQXJyYXk8c3RyaW5nPiA9IFtdO1xuICAgIC8qKlxuICAgICAqIENvbXBvZG9jIGNvbmZpZ3VyYXRpb24gbG9jYWwgcmVmZXJlbmNlXG4gICAgICovXG4gICAgY29uZmlndXJhdGlvbjpDb25maWd1cmF0aW9uSW50ZXJmYWNlO1xuICAgIC8qKlxuICAgICAqIEJvb2xlYW4gZm9yIHdhdGNoaW5nIHN0YXR1c1xuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzV2F0Y2hpbmc6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBjb21wb2RvYyBhcHBsaWNhdGlvbiBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBvcHRpb25zIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBvcHRpb25zIHRoYXQgc2hvdWxkIGJlIHVzZWQuXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucz86T2JqZWN0KSB7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbiA9IENvbmZpZ3VyYXRpb24uZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgICBmb3IgKGxldCBvcHRpb24gaW4gb3B0aW9ucyApIHtcbiAgICAgICAgICAgIGlmKHR5cGVvZiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGFbb3B0aW9uXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGFbb3B0aW9uXSA9IG9wdGlvbnNbb3B0aW9uXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEZvciBkb2N1bWVudGF0aW9uTWFpbk5hbWUsIHByb2Nlc3MgaXQgb3V0c2lkZSB0aGUgbG9vcCwgZm9yIGhhbmRsaW5nIGNvbmZsaWN0IHdpdGggcGFnZXMgbmFtZVxuICAgICAgICAgICAgaWYob3B0aW9uID09PSAnbmFtZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGFbJ2RvY3VtZW50YXRpb25NYWluTmFtZSddID0gb3B0aW9uc1tvcHRpb25dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRm9yIGRvY3VtZW50YXRpb25NYWluTmFtZSwgcHJvY2VzcyBpdCBvdXRzaWRlIHRoZSBsb29wLCBmb3IgaGFuZGxpbmcgY29uZmxpY3Qgd2l0aCBwYWdlcyBuYW1lXG4gICAgICAgICAgICBpZihvcHRpb24gPT09ICdzaWxlbnQnKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLnNpbGVudCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgY29tcG9kb2MgcHJvY2Vzc1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZW5lcmF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQuY2hhckF0KHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQubGVuZ3RoIC0gMSkgIT09ICcvJykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCArPSAnLyc7XG4gICAgICAgIH1cbiAgICAgICAgJGh0bWxlbmdpbmUuaW5pdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wcm9jZXNzUGFja2FnZUpzb24oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgY29tcG9kb2MgZG9jdW1lbnRhdGlvbiBjb3ZlcmFnZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCB0ZXN0Q292ZXJhZ2UoKSB7XG4gICAgICAgIHRoaXMuZ2V0RGVwZW5kZW5jaWVzRGF0YSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0b3JlIGZpbGVzIGZvciBpbml0aWFsIHByb2Nlc3NpbmdcbiAgICAgKiBAcGFyYW0gIHtBcnJheTxzdHJpbmc+fSBmaWxlcyBGaWxlcyBmb3VuZCBkdXJpbmcgc291cmNlIGZvbGRlciBhbmQgdHNjb25maWcgc2NhblxuICAgICAqL1xuICAgIHNldEZpbGVzKGZpbGVzOkFycmF5PHN0cmluZz4pIHtcbiAgICAgICAgdGhpcy5maWxlcyA9IGZpbGVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0b3JlIGZpbGVzIGZvciB3YXRjaCBwcm9jZXNzaW5nXG4gICAgICogQHBhcmFtICB7QXJyYXk8c3RyaW5nPn0gZmlsZXMgRmlsZXMgZm91bmQgZHVyaW5nIHNvdXJjZSBmb2xkZXIgYW5kIHRzY29uZmlnIHNjYW5cbiAgICAgKi9cbiAgICBzZXRVcGRhdGVkRmlsZXMoZmlsZXM6QXJyYXk8c3RyaW5nPikge1xuICAgICAgICB0aGlzLnVwZGF0ZWRGaWxlcyA9IGZpbGVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhIGJvb2xlYW4gaW5kaWNhdGluZyBwcmVzZW5jZSBvZiBvbmUgVHlwZVNjcmlwdCBmaWxlIGluIHVwZGF0ZWRGaWxlcyBsaXN0XG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gUmVzdWx0IG9mIHNjYW5cbiAgICAgKi9cbiAgICBoYXNXYXRjaGVkRmlsZXNUU0ZpbGVzKCk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gZmFsc2U7XG5cbiAgICAgICAgXy5mb3JFYWNoKHRoaXMudXBkYXRlZEZpbGVzLCAoZmlsZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHBhdGguZXh0bmFtZShmaWxlKSA9PT0gJy50cycpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhIGJvb2xlYW4gaW5kaWNhdGluZyBwcmVzZW5jZSBvZiBvbmUgcm9vdCBtYXJrZG93biBmaWxlcyBpbiB1cGRhdGVkRmlsZXMgbGlzdFxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFJlc3VsdCBvZiBzY2FuXG4gICAgICovXG4gICAgaGFzV2F0Y2hlZEZpbGVzUm9vdE1hcmtkb3duRmlsZXMoKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBmYWxzZTtcblxuICAgICAgICBfLmZvckVhY2godGhpcy51cGRhdGVkRmlsZXMsIChmaWxlKSA9PiB7XG4gICAgICAgICAgICBpZiAocGF0aC5leHRuYW1lKGZpbGUpID09PSAnLm1kJyAmJiBwYXRoLmRpcm5hbWUoZmlsZSkgPT09IHByb2Nlc3MuY3dkKCkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsZWFyIGZpbGVzIGZvciB3YXRjaCBwcm9jZXNzaW5nXG4gICAgICovXG4gICAgY2xlYXJVcGRhdGVkRmlsZXMoKSB7XG4gICAgICAgIHRoaXMudXBkYXRlZEZpbGVzID0gW107XG4gICAgICAgIHRoaXMud2F0Y2hDaGFuZ2VkRmlsZXMgPSBbXTtcbiAgICB9XG5cbiAgICBwcm9jZXNzUGFja2FnZUpzb24oKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdTZWFyY2hpbmcgcGFja2FnZS5qc29uIGZpbGUnKTtcbiAgICAgICAgJGZpbGVlbmdpbmUuZ2V0KCdwYWNrYWdlLmpzb24nKS50aGVuKChwYWNrYWdlRGF0YSkgPT4ge1xuICAgICAgICAgICAgbGV0IHBhcnNlZERhdGEgPSBKU09OLnBhcnNlKHBhY2thZ2VEYXRhKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyc2VkRGF0YS5uYW1lICE9PSAndW5kZWZpbmVkJyAmJiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZG9jdW1lbnRhdGlvbk1haW5OYW1lID09PSBDT01QT0RPQ19ERUZBVUxUUy50aXRsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kb2N1bWVudGF0aW9uTWFpbk5hbWUgPSBwYXJzZWREYXRhLm5hbWUgKyAnIGRvY3VtZW50YXRpb24nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJzZWREYXRhLmRlc2NyaXB0aW9uICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kb2N1bWVudGF0aW9uTWFpbkRlc2NyaXB0aW9uID0gcGFyc2VkRGF0YS5kZXNjcmlwdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hbmd1bGFyVmVyc2lvbiA9IGdldEFuZ3VsYXJWZXJzaW9uT2ZQcm9qZWN0KHBhcnNlZERhdGEpO1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ3BhY2thZ2UuanNvbiBmaWxlIGZvdW5kJyk7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NNYXJrZG93bnMoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmdldERlcGVuZGVuY2llc0RhdGEoKTtcbiAgICAgICAgICAgIH0sIChlcnJvck1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignQ29udGludWluZyB3aXRob3V0IHBhY2thZ2UuanNvbiBmaWxlJyk7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NNYXJrZG93bnMoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmdldERlcGVuZGVuY2llc0RhdGEoKTtcbiAgICAgICAgICAgIH0sIChlcnJvck1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm9jZXNzTWFya2Rvd25zKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnU2VhcmNoaW5nIFJFQURNRS5tZCwgQ0hBTkdFTE9HLm1kLCBDT05UUklCVVRJTkcubWQsIExJQ0VOU0UubWQsIFRPRE8ubWQgZmlsZXMnKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbWFya2Rvd25zID0gWydyZWFkbWUnLCAnY2hhbmdlbG9nJywgJ2NvbnRyaWJ1dGluZycsICdsaWNlbnNlJywgJ3RvZG8nXSxcbiAgICAgICAgICAgIG51bWJlck9mTWFya2Rvd25zID0gNSxcbiAgICAgICAgICAgIGxvb3AgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPCBudW1iZXJPZk1hcmtkb3ducykge1xuICAgICAgICAgICAgICAgICAgICAkbWFya2Rvd25lbmdpbmUuZ2V0VHJhZGl0aW9uYWxNYXJrZG93bihtYXJrZG93bnNbaV0udG9VcHBlckNhc2UoKSkudGhlbigocmVhZG1lRGF0YTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogKG1hcmtkb3duc1tpXSA9PT0gJ3JlYWRtZScpID8gJ2luZGV4JyA6IG1hcmtkb3duc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnZ2V0dGluZy1zdGFydGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZG93bjogcmVhZG1lRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXB0aDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5ST09UXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXJrZG93bnNbaV0gPT09ICdyZWFkbWUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnJlYWRtZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnb3ZlcnZpZXcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnb3ZlcnZpZXcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5ST09UXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tYXJrZG93bnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG1hcmtkb3duc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBwZXJuYW1lOiBtYXJrZG93bnNbaV0udG9VcHBlckNhc2UoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGg6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLlJPT1RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYCR7bWFya2Rvd25zW2ldLnRvVXBwZXJDYXNlKCl9Lm1kIGZpbGUgZm91bmRgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgKGVycm9yTWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKGBDb250aW51aW5nIHdpdGhvdXQgJHttYXJrZG93bnNbaV0udG9VcHBlckNhc2UoKX0ubWQgZmlsZWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hcmtkb3duc1tpXSA9PT0gJ3JlYWRtZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdpbmRleCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdvdmVydmlldydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsb29wKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlYnVpbGRSb290TWFya2Rvd25zKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUmVnZW5lcmF0aW5nIFJFQURNRS5tZCwgQ0hBTkdFTE9HLm1kLCBDT05UUklCVVRJTkcubWQsIExJQ0VOU0UubWQsIFRPRE8ubWQgcGFnZXMnKTtcblxuICAgICAgICBsZXQgYWN0aW9ucyA9IFtdO1xuXG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5yZXNldFJvb3RNYXJrZG93blBhZ2VzKCk7XG5cbiAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJvY2Vzc01hcmtkb3ducygpOyB9KTtcblxuICAgICAgICBwcm9taXNlU2VxdWVudGlhbChhY3Rpb25zKVxuICAgICAgICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NQYWdlcygpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJVcGRhdGVkRmlsZXMoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3JNZXNzYWdlID0+IHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBkZXBlbmRlbmN5IGRhdGEgZm9yIHNtYWxsIGdyb3VwIG9mIHVwZGF0ZWQgZmlsZXMgZHVyaW5nIHdhdGNoIHByb2Nlc3NcbiAgICAgKi9cbiAgICBnZXRNaWNyb0RlcGVuZGVuY2llc0RhdGEoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdHZXQgZGlmZiBkZXBlbmRlbmNpZXMgZGF0YScpO1xuICAgICAgICBsZXQgY3Jhd2xlciA9IG5ldyBEZXBlbmRlbmNpZXMoXG4gICAgICAgICAgdGhpcy51cGRhdGVkRmlsZXMsIHtcbiAgICAgICAgICAgIHRzY29uZmlnRGlyZWN0b3J5OiBwYXRoLmRpcm5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnKVxuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgZGVwZW5kZW5jaWVzRGF0YSA9IGNyYXdsZXIuZ2V0RGVwZW5kZW5jaWVzKCk7XG5cbiAgICAgICAgJGRlcGVuZGVuY2llc0VuZ2luZS51cGRhdGUoZGVwZW5kZW5jaWVzRGF0YSk7XG5cbiAgICAgICAgdGhpcy5wcmVwYXJlSnVzdEFGZXdUaGluZ3MoZGVwZW5kZW5jaWVzRGF0YSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVidWlsZCBleHRlcm5hbCBkb2N1bWVudGF0aW9uIGR1cmluZyB3YXRjaCBwcm9jZXNzXG4gICAgICovXG4gICAgcmVidWlsZEV4dGVybmFsRG9jdW1lbnRhdGlvbigpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1JlYnVpbGQgZXh0ZXJuYWwgZG9jdW1lbnRhdGlvbicpO1xuXG4gICAgICAgIGxldCBhY3Rpb25zID0gW107XG5cbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLnJlc2V0QWRkaXRpb25hbFBhZ2VzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlcyAhPT0gJycpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVFeHRlcm5hbEluY2x1ZGVzKCk7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvbWlzZVNlcXVlbnRpYWwoYWN0aW9ucylcbiAgICAgICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzUGFnZXMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyVXBkYXRlZEZpbGVzKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yTWVzc2FnZSA9PiB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXREZXBlbmRlbmNpZXNEYXRhKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnR2V0IGRlcGVuZGVuY2llcyBkYXRhJyk7XG5cbiAgICAgICAgbGV0IGNyYXdsZXIgPSBuZXcgRGVwZW5kZW5jaWVzKFxuICAgICAgICAgIHRoaXMuZmlsZXMsIHtcbiAgICAgICAgICAgIHRzY29uZmlnRGlyZWN0b3J5OiBwYXRoLmRpcm5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnKVxuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgZGVwZW5kZW5jaWVzRGF0YSA9IGNyYXdsZXIuZ2V0RGVwZW5kZW5jaWVzKCk7XG5cbiAgICAgICAgJGRlcGVuZGVuY2llc0VuZ2luZS5pbml0KGRlcGVuZGVuY2llc0RhdGEpO1xuXG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5yb3V0ZXNMZW5ndGggPSBSb3V0ZXJQYXJzZXIucm91dGVzTGVuZ3RoKCk7XG5cbiAgICAgICAgdGhpcy5wcmVwYXJlRXZlcnl0aGluZygpO1xuICAgIH1cblxuICAgIHByZXBhcmVKdXN0QUZld1RoaW5ncyhkaWZmQ3Jhd2xlZERhdGEpIHtcbiAgICAgICAgbGV0IGFjdGlvbnMgPSBbXTtcblxuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ucmVzZXRQYWdlcygpO1xuXG4gICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVSb3V0ZXMoKTsgfSk7XG5cbiAgICAgICAgaWYgKGRpZmZDcmF3bGVkRGF0YS5tb2R1bGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVNb2R1bGVzKCk7IH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkaWZmQ3Jhd2xlZERhdGEuY29tcG9uZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlQ29tcG9uZW50cygpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkaWZmQ3Jhd2xlZERhdGEuZGlyZWN0aXZlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlRGlyZWN0aXZlcygpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkaWZmQ3Jhd2xlZERhdGEuaW5qZWN0YWJsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZUluamVjdGFibGVzKCk7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRpZmZDcmF3bGVkRGF0YS5waXBlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlUGlwZXMoKTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGlmZkNyYXdsZWREYXRhLmNsYXNzZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZUNsYXNzZXMoKTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGlmZkNyYXdsZWREYXRhLmludGVyZmFjZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZUludGVyZmFjZXMoKTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGlmZkNyYXdsZWREYXRhLm1pc2NlbGxhbmVvdXMudmFyaWFibGVzLmxlbmd0aCA+IDAgfHxcbiAgICAgICAgICAgIGRpZmZDcmF3bGVkRGF0YS5taXNjZWxsYW5lb3VzLmZ1bmN0aW9ucy5sZW5ndGggPiAwIHx8XG4gICAgICAgICAgICBkaWZmQ3Jhd2xlZERhdGEubWlzY2VsbGFuZW91cy50eXBlYWxpYXNlcy5sZW5ndGggPiAwIHx8XG4gICAgICAgICAgICBkaWZmQ3Jhd2xlZERhdGEubWlzY2VsbGFuZW91cy5lbnVtZXJhdGlvbnMubGVuZ3RoID4gMCB8fFxuICAgICAgICAgICAgZGlmZkNyYXdsZWREYXRhLm1pc2NlbGxhbmVvdXMudHlwZXMubGVuZ3RoID4gMCApIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVNaXNjZWxsYW5lb3VzKCk7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUNvdmVyYWdlKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlQ292ZXJhZ2UoKTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm9taXNlU2VxdWVudGlhbChhY3Rpb25zKVxuICAgICAgICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NHcmFwaHMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyVXBkYXRlZEZpbGVzKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yTWVzc2FnZSA9PiB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlRXZlcnl0aGluZygpIHtcbiAgICAgICAgbGV0IGFjdGlvbnMgPSBbXTtcblxuICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlTW9kdWxlcygpOyB9KTtcbiAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZUNvbXBvbmVudHMoKTsgfSk7XG5cbiAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUuZGlyZWN0aXZlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlRGlyZWN0aXZlcygpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLmluamVjdGFibGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVJbmplY3RhYmxlcygpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLnJvdXRlcyAmJiAkZGVwZW5kZW5jaWVzRW5naW5lLnJvdXRlcy5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlUm91dGVzKCk7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUucGlwZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZVBpcGVzKCk7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUuY2xhc3Nlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlQ2xhc3NlcygpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLmludGVyZmFjZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZUludGVyZmFjZXMoKTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5taXNjZWxsYW5lb3VzLnZhcmlhYmxlcy5sZW5ndGggPiAwIHx8XG4gICAgICAgICAgICAkZGVwZW5kZW5jaWVzRW5naW5lLm1pc2NlbGxhbmVvdXMuZnVuY3Rpb25zLmxlbmd0aCA+IDAgfHxcbiAgICAgICAgICAgICRkZXBlbmRlbmNpZXNFbmdpbmUubWlzY2VsbGFuZW91cy50eXBlYWxpYXNlcy5sZW5ndGggPiAwIHx8XG4gICAgICAgICAgICAkZGVwZW5kZW5jaWVzRW5naW5lLm1pc2NlbGxhbmVvdXMuZW51bWVyYXRpb25zLmxlbmd0aCA+IDAgfHxcbiAgICAgICAgICAgICRkZXBlbmRlbmNpZXNFbmdpbmUubWlzY2VsbGFuZW91cy50eXBlcy5sZW5ndGggPiAwICkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZU1pc2NlbGxhbmVvdXMoKTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlQ292ZXJhZ2UpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVDb3ZlcmFnZSgpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgIT09ICcnKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlRXh0ZXJuYWxJbmNsdWRlcygpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb21pc2VTZXF1ZW50aWFsKGFjdGlvbnMpXG4gICAgICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0dyYXBocygpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvck1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJlcGFyZUV4dGVybmFsSW5jbHVkZXMoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdBZGRpbmcgZXh0ZXJuYWwgbWFya2Rvd24gZmlsZXMnKTtcbiAgICAgICAgLy9TY2FuIGluY2x1ZGUgZm9sZGVyIGZvciBmaWxlcyBkZXRhaWxlZCBpbiBzdW1tYXJ5Lmpzb25cbiAgICAgICAgLy9Gb3IgZWFjaCBmaWxlLCBhZGQgdG8gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFkZGl0aW9uYWxQYWdlc1xuICAgICAgICAvL0VhY2ggZmlsZSB3aWxsIGJlIGNvbnZlcnRlZCB0byBodG1sIHBhZ2UsIGluc2lkZSBDT01QT0RPQ19ERUZBVUxUUy5hZGRpdGlvbmFsRW50cnlQYXRoXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICRmaWxlZW5naW5lLmdldCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgKyBwYXRoLnNlcCArICdzdW1tYXJ5Lmpzb24nKS50aGVuKChzdW1tYXJ5RGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ0FkZGl0aW9uYWwgZG9jdW1lbnRhdGlvbjogc3VtbWFyeS5qc29uIGZpbGUgZm91bmQnKTtcblxuICAgICAgICAgICAgICAgbGV0IHBhcnNlZFN1bW1hcnlEYXRhID0gSlNPTi5wYXJzZShzdW1tYXJ5RGF0YSksXG4gICAgICAgICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICAgICAgICAgbGVuID0gcGFyc2VkU3VtbWFyeURhdGEubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgIGxvb3AgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYoIGkgPD0gbGVuLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJG1hcmtkb3duZW5naW5lLmdldCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgKyBwYXRoLnNlcCArIHBhcnNlZFN1bW1hcnlEYXRhW2ldLmZpbGUpLnRoZW4oKG1hcmtlZERhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRBZGRpdGlvbmFsUGFnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcGFyc2VkU3VtbWFyeURhdGFbaV0udGl0bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IGNsZWFuTmFtZVdpdGhvdXRTcGFjZUFuZFRvTG93ZXJDYXNlKHBhcnNlZFN1bW1hcnlEYXRhW2ldLnRpdGxlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnYWRkaXRpb25hbC1wYWdlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXNGb2xkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbFBhZ2U6IG1hcmtlZERhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGg6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuSU5URVJOQUxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VkU3VtbWFyeURhdGFbaV0uY2hpbGRyZW4gJiYgcGFyc2VkU3VtbWFyeURhdGFbaV0uY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBqID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuZyA9IHBhcnNlZFN1bW1hcnlEYXRhW2ldLmNoaWxkcmVuLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3BDaGlsZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiggaiA8PSBsZW5nLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJG1hcmtkb3duZW5naW5lLmdldCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgKyBwYXRoLnNlcCArIHBhcnNlZFN1bW1hcnlEYXRhW2ldLmNoaWxkcmVuW2pdLmZpbGUpLnRoZW4oKG1hcmtlZERhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRBZGRpdGlvbmFsUGFnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcGFyc2VkU3VtbWFyeURhdGFbaV0uY2hpbGRyZW5bal0udGl0bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IGNsZWFuTmFtZVdpdGhvdXRTcGFjZUFuZFRvTG93ZXJDYXNlKHBhcnNlZFN1bW1hcnlEYXRhW2ldLmNoaWxkcmVuW2pdLnRpdGxlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnYWRkaXRpb25hbC1wYWdlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXNGb2xkZXIgKyAnLycgKyBjbGVhbk5hbWVXaXRob3V0U3BhY2VBbmRUb0xvd2VyQ2FzZShwYXJzZWRTdW1tYXJ5RGF0YVtpXS50aXRsZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbFBhZ2U6IG1hcmtlZERhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGg6IDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuSU5URVJOQUxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaisrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcENoaWxkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3BDaGlsZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgIHJlamVjdCgnRXJyb3IgZHVyaW5nIEFkZGl0aW9uYWwgZG9jdW1lbnRhdGlvbiBnZW5lcmF0aW9uJyk7XG4gICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlTW9kdWxlcyhzb21lTW9kdWxlcz8pIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgbW9kdWxlcycpO1xuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBfbW9kdWxlcyA9IChzb21lTW9kdWxlcykgPyBzb21lTW9kdWxlcyA6ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0TW9kdWxlcygpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzID0gX21vZHVsZXMubWFwKG5nTW9kdWxlID0+IHtcbiAgICAgICAgICAgICAgICBbJ2RlY2xhcmF0aW9ucycsICdib290c3RyYXAnLCAnaW1wb3J0cycsICdleHBvcnRzJ10uZm9yRWFjaChtZXRhZGF0YVR5cGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBuZ01vZHVsZVttZXRhZGF0YVR5cGVdID0gbmdNb2R1bGVbbWV0YWRhdGFUeXBlXS5maWx0ZXIobWV0YURhdGFJdGVtID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAobWV0YURhdGFJdGVtLnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdkaXJlY3RpdmUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXREaXJlY3RpdmVzKCkuc29tZShkaXJlY3RpdmUgPT4gZGlyZWN0aXZlLm5hbWUgPT09IG1ldGFEYXRhSXRlbS5uYW1lKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NvbXBvbmVudCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkZGVwZW5kZW5jaWVzRW5naW5lLmdldENvbXBvbmVudHMoKS5zb21lKGNvbXBvbmVudCA9PiBjb21wb25lbnQubmFtZSA9PT0gbWV0YURhdGFJdGVtLm5hbWUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbW9kdWxlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0TW9kdWxlcygpLnNvbWUobW9kdWxlID0+IG1vZHVsZS5uYW1lID09PSBtZXRhRGF0YUl0ZW0ubmFtZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdwaXBlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0UGlwZXMoKS5zb21lKHBpcGUgPT4gcGlwZS5uYW1lID09PSBtZXRhRGF0YUl0ZW0ubmFtZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbmdNb2R1bGUucHJvdmlkZXJzID0gbmdNb2R1bGUucHJvdmlkZXJzLmZpbHRlcihwcm92aWRlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkZGVwZW5kZW5jaWVzRW5naW5lLmdldEluamVjdGFibGVzKCkuc29tZShpbmplY3RhYmxlID0+IGluamVjdGFibGUubmFtZSA9PT0gcHJvdmlkZXIubmFtZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5nTW9kdWxlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogJ21vZHVsZXMnLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdtb2R1bGVzJyxcbiAgICAgICAgICAgICAgICBkZXB0aDogMCxcbiAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5ST09UXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzLmxlbmd0aDtcblxuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgICAgIHBhdGg6ICdtb2R1bGVzJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ21vZHVsZScsXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXNbaV0sXG4gICAgICAgICAgICAgICAgICAgIGRlcHRoOiAxLFxuICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5JTlRFUk5BTFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVQaXBlcyA9IChzb21lUGlwZXM/KSA9PiB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcmVwYXJlIHBpcGVzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlcyA9IChzb21lUGlwZXMpID8gc29tZVBpcGVzIDogJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRQaXBlcygpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzLmxlbmd0aDtcblxuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgICAgIHBhdGg6ICdwaXBlcycsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlc1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAncGlwZScsXG4gICAgICAgICAgICAgICAgICAgIHBpcGU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgZGVwdGg6IDEsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLklOVEVSTkFMXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVDbGFzc2VzID0gKHNvbWVDbGFzc2VzPykgPT4ge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBjbGFzc2VzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jbGFzc2VzID0gKHNvbWVDbGFzc2VzKSA/IHNvbWVDbGFzc2VzIDogJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRDbGFzc2VzKCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3Nlcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICBwYXRoOiAnY2xhc3NlcycsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jbGFzc2VzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdjbGFzcycsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3Nlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgZGVwdGg6IDEsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLklOVEVSTkFMXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVJbnRlcmZhY2VzKHNvbWVJbnRlcmZhY2VzPykge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBpbnRlcmZhY2VzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzID0gKHNvbWVJbnRlcmZhY2VzKSA/IHNvbWVJbnRlcmZhY2VzIDogJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRJbnRlcmZhY2VzKCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlcy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogJ2ludGVyZmFjZXMnLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlc1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnaW50ZXJmYWNlJyxcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJmYWNlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgZGVwdGg6IDEsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLklOVEVSTkFMXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVNaXNjZWxsYW5lb3VzKHNvbWVNaXNjPykge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBtaXNjZWxsYW5lb3VzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5taXNjZWxsYW5lb3VzID0gKHNvbWVNaXNjKSA/IHNvbWVNaXNjIDogJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRNaXNjZWxsYW5lb3VzKCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnbWlzY2VsbGFuZW91cycsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ21pc2NlbGxhbmVvdXMnLFxuICAgICAgICAgICAgICAgIGRlcHRoOiAwLFxuICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLlJPT1RcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlQ29tcG9uZW50cyhzb21lQ29tcG9uZW50cz8pIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgY29tcG9uZW50cycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50cyA9IChzb21lQ29tcG9uZW50cykgPyBzb21lQ29tcG9uZW50cyA6ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0Q29tcG9uZW50cygpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgobWFpblJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBsb29wID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiggaSA8PSBsZW4tMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRpcm5hbWUgPSBwYXRoLmRpcm5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0uZmlsZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlVGVtcGxhdGV1cmwgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGVtcGxhdGVQYXRoID0gcGF0aC5yZXNvbHZlKGRpcm5hbWUgKyBwYXRoLnNlcCArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLnRlbXBsYXRlVXJsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHRlbXBsYXRlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZSh0ZW1wbGF0ZVBhdGgsICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0udGVtcGxhdGVEYXRhID0gZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYENhbm5vdCByZWFkIHRlbXBsYXRlIGZvciAke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLm5hbWV9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJG1hcmtkb3duZW5naW5lLmNvbXBvbmVudEhhc1JlYWRtZUZpbGUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0uZmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgJHt0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5uYW1lfSBoYXMgYSBSRUFETUUgZmlsZSwgaW5jbHVkZSBpdGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZWFkbWVGaWxlID0gJG1hcmtkb3duZW5naW5lLmNvbXBvbmVudFJlYWRtZUZpbGUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0uZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnMucmVhZEZpbGUocmVhZG1lRmlsZSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0ucmVhZG1lID0gbWFya2VkKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiAnY29tcG9uZW50cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ2NvbXBvbmVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGg6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5JTlRFUk5BTFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLnRlbXBsYXRlVXJsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGAke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLm5hbWV9IGhhcyBhIHRlbXBsYXRlVXJsLCBpbmNsdWRlIGl0YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVUZW1wbGF0ZXVybCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiAnY29tcG9uZW50cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdjb21wb25lbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXB0aDogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuSU5URVJOQUxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0udGVtcGxhdGVVcmwubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgJHt0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5uYW1lfSBoYXMgYSB0ZW1wbGF0ZVVybCwgaW5jbHVkZSBpdGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVUZW1wbGF0ZXVybCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haW5SZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlRGlyZWN0aXZlcyA9IChzb21lRGlyZWN0aXZlcz8pID0+IHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgZGlyZWN0aXZlcycpO1xuXG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXJlY3RpdmVzID0gKHNvbWVEaXJlY3RpdmVzKSA/IHNvbWVEaXJlY3RpdmVzIDogJGRlcGVuZGVuY2llc0VuZ2luZS5nZXREaXJlY3RpdmVzKCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlyZWN0aXZlcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICBwYXRoOiAnZGlyZWN0aXZlcycsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXJlY3RpdmVzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdkaXJlY3RpdmUnLFxuICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXJlY3RpdmVzW2ldLFxuICAgICAgICAgICAgICAgICAgICBkZXB0aDogMSxcbiAgICAgICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuSU5URVJOQUxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJlcGFyZUluamVjdGFibGVzKHNvbWVJbmplY3RhYmxlcz8pIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgaW5qZWN0YWJsZXMnKTtcblxuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXMgPSAoc29tZUluamVjdGFibGVzKSA/IHNvbWVJbmplY3RhYmxlcyA6ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0SW5qZWN0YWJsZXMoKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICBwYXRoOiAnaW5qZWN0YWJsZXMnLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ2luamVjdGFibGUnLFxuICAgICAgICAgICAgICAgICAgICBpbmplY3RhYmxlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXNbaV0sXG4gICAgICAgICAgICAgICAgICAgIGRlcHRoOiAxLFxuICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5JTlRFUk5BTFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlUm91dGVzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyByb3V0ZXMnKTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnJvdXRlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0Um91dGVzKCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIG5hbWU6ICdyb3V0ZXMnLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdyb3V0ZXMnLFxuICAgICAgICAgICAgICAgIGRlcHRoOiAwLFxuICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLlJPT1RcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBSb3V0ZXJQYXJzZXIuZ2VuZXJhdGVSb3V0ZXNJbmRleCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0LCB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucm91dGVzKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnUm91dGVzIGluZGV4IGdlbmVyYXRlZCcpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0sIChlKSA9PsKge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVDb3ZlcmFnZSgpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3MgZG9jdW1lbnRhdGlvbiBjb3ZlcmFnZSByZXBvcnQnKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAqIGxvb3Agd2l0aCBjb21wb25lbnRzLCBjbGFzc2VzLCBpbmplY3RhYmxlcywgaW50ZXJmYWNlcywgcGlwZXNcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdmFyIGZpbGVzID0gW10sXG4gICAgICAgICAgICAgICAgdG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCA9IDAsXG4gICAgICAgICAgICAgICAgZ2V0U3RhdHVzID0gZnVuY3Rpb24ocGVyY2VudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdHVzO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGVyY2VudCA8PSAyNSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gJ2xvdyc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGVyY2VudCA+IDI1ICYmIHBlcmNlbnQgPD0gNTApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cyA9ICdtZWRpdW0nO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBlcmNlbnQgPiA1MCAmJiBwZXJjZW50IDw9IDc1KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMgPSAnZ29vZCc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMgPSAnZ29vZCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1cztcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBfLmZvckVhY2godGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHMsIChjb21wb25lbnQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5wcm9wZXJ0aWVzQ2xhc3MgfHxcbiAgICAgICAgICAgICAgICAgICAgIWNvbXBvbmVudC5tZXRob2RzQ2xhc3MgfHxcbiAgICAgICAgICAgICAgICAgICAgIWNvbXBvbmVudC5pbnB1dHNDbGFzcyB8fFxuICAgICAgICAgICAgICAgICAgICAhY29tcG9uZW50Lm91dHB1dHNDbGFzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IGNsOmFueSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBjb21wb25lbnQuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGNvbXBvbmVudC50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGlua3R5cGU6IGNvbXBvbmVudC50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY29tcG9uZW50Lm5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gY29tcG9uZW50LnByb3BlcnRpZXNDbGFzcy5sZW5ndGggKyBjb21wb25lbnQubWV0aG9kc0NsYXNzLmxlbmd0aCArIGNvbXBvbmVudC5pbnB1dHNDbGFzcy5sZW5ndGggKyBjb21wb25lbnQub3V0cHV0c0NsYXNzLmxlbmd0aCArIDE7IC8vICsxIGZvciBjb21wb25lbnQgZGVjb3JhdG9yIGNvbW1lbnRcblxuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuY29uc3RydWN0b3JPYmopIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuY29uc3RydWN0b3JPYmogJiYgY29tcG9uZW50LmNvbnN0cnVjdG9yT2JqLmRlc2NyaXB0aW9uICYmIGNvbXBvbmVudC5jb25zdHJ1Y3Rvck9iai5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuZGVzY3JpcHRpb24gJiYgY29tcG9uZW50LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBfLmZvckVhY2goY29tcG9uZW50LnByb3BlcnRpZXNDbGFzcywgKHByb3BlcnR5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5tb2RpZmllcktpbmQgPT09IDExMSkgeyAvLyBEb2Vzbid0IGhhbmRsZSBwcml2YXRlIGZvciBjb3ZlcmFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzIC09IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYocHJvcGVydHkuZGVzY3JpcHRpb24gJiYgcHJvcGVydHkuZGVzY3JpcHRpb24gIT09ICcnICYmIHByb3BlcnR5Lm1vZGlmaWVyS2luZCAhPT0gMTExKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChjb21wb25lbnQubWV0aG9kc0NsYXNzLCAobWV0aG9kKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXRob2QubW9kaWZpZXJLaW5kID09PSAxMTEpIHsgLy8gRG9lc24ndCBoYW5kbGUgcHJpdmF0ZSBmb3IgY292ZXJhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50cyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKG1ldGhvZC5kZXNjcmlwdGlvbiAmJiBtZXRob2QuZGVzY3JpcHRpb24gIT09ICcnICYmIG1ldGhvZC5tb2RpZmllcktpbmQgIT09IDExMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2goY29tcG9uZW50LmlucHV0c0NsYXNzLCAoaW5wdXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlucHV0Lm1vZGlmaWVyS2luZCA9PT0gMTExKSB7IC8vIERvZXNuJ3QgaGFuZGxlIHByaXZhdGUgZm9yIGNvdmVyYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihpbnB1dC5kZXNjcmlwdGlvbiAmJiBpbnB1dC5kZXNjcmlwdGlvbiAhPT0gJycgJiYgaW5wdXQubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKGNvbXBvbmVudC5vdXRwdXRzQ2xhc3MsIChvdXRwdXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dC5tb2RpZmllcktpbmQgPT09IDExMSkgeyAvLyBEb2Vzbid0IGhhbmRsZSBwcml2YXRlIGZvciBjb3ZlcmFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzIC09IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYob3V0cHV0LmRlc2NyaXB0aW9uICYmIG91dHB1dC5kZXNjcmlwdGlvbiAhPT0gJycgJiYgb3V0cHV0Lm1vZGlmaWVyS2luZCAhPT0gMTExKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gTWF0aC5mbG9vcigodG90YWxTdGF0ZW1lbnREb2N1bWVudGVkIC8gdG90YWxTdGF0ZW1lbnRzKSAqIDEwMCk7XG4gICAgICAgICAgICAgICAgaWYodG90YWxTdGF0ZW1lbnRzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICAgICAgY2wuc3RhdHVzID0gZ2V0U3RhdHVzKGNsLmNvdmVyYWdlUGVyY2VudCk7XG4gICAgICAgICAgICAgICAgdG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCArPSBjbC5jb3ZlcmFnZVBlcmNlbnQ7XG4gICAgICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jbGFzc2VzLCAoY2xhc3NlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFjbGFzc2UucHJvcGVydGllcyB8fFxuICAgICAgICAgICAgICAgICAgICAhY2xhc3NlLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBjbDphbnkgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogY2xhc3NlLmZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY2xhc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGlua3R5cGU6ICdjbGFzc2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2xhc3NlLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gY2xhc3NlLnByb3BlcnRpZXMubGVuZ3RoICsgY2xhc3NlLm1ldGhvZHMubGVuZ3RoICsgMTsgLy8gKzEgZm9yIGNsYXNzIGl0c2VsZlxuXG4gICAgICAgICAgICAgICAgaWYgKGNsYXNzZS5jb25zdHJ1Y3Rvck9iaikge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNsYXNzZS5jb25zdHJ1Y3Rvck9iaiAmJiBjbGFzc2UuY29uc3RydWN0b3JPYmouZGVzY3JpcHRpb24gJiYgY2xhc3NlLmNvbnN0cnVjdG9yT2JqLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNsYXNzZS5kZXNjcmlwdGlvbiAmJiBjbGFzc2UuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChjbGFzc2UucHJvcGVydGllcywgKHByb3BlcnR5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5tb2RpZmllcktpbmQgPT09IDExMSkgeyAvLyBEb2Vzbid0IGhhbmRsZSBwcml2YXRlIGZvciBjb3ZlcmFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzIC09IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYocHJvcGVydHkuZGVzY3JpcHRpb24gJiYgcHJvcGVydHkuZGVzY3JpcHRpb24gIT09ICcnICYmIHByb3BlcnR5Lm1vZGlmaWVyS2luZCAhPT0gMTExKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChjbGFzc2UubWV0aG9kcywgKG1ldGhvZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWV0aG9kLm1vZGlmaWVyS2luZCA9PT0gMTExKSB7IC8vIERvZXNuJ3QgaGFuZGxlIHByaXZhdGUgZm9yIGNvdmVyYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihtZXRob2QuZGVzY3JpcHRpb24gJiYgbWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJyAmJiBtZXRob2QubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgICAgICBpZih0b3RhbFN0YXRlbWVudHMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VDb3VudCA9IHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArICcvJyArIHRvdGFsU3RhdGVtZW50cztcbiAgICAgICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkICs9IGNsLmNvdmVyYWdlUGVyY2VudDtcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGNsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlcywgKGluamVjdGFibGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWluamVjdGFibGUucHJvcGVydGllcyB8fFxuICAgICAgICAgICAgICAgICAgICAhaW5qZWN0YWJsZS5tZXRob2RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgY2w6YW55ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGluamVjdGFibGUuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGluamVjdGFibGUudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmt0eXBlOiBpbmplY3RhYmxlLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpbmplY3RhYmxlLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gaW5qZWN0YWJsZS5wcm9wZXJ0aWVzLmxlbmd0aCArIGluamVjdGFibGUubWV0aG9kcy5sZW5ndGggKyAxOyAvLyArMSBmb3IgaW5qZWN0YWJsZSBpdHNlbGZcblxuICAgICAgICAgICAgICAgIGlmIChpbmplY3RhYmxlLmNvbnN0cnVjdG9yT2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50cyArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5qZWN0YWJsZS5jb25zdHJ1Y3Rvck9iaiAmJiBpbmplY3RhYmxlLmNvbnN0cnVjdG9yT2JqLmRlc2NyaXB0aW9uICYmIGluamVjdGFibGUuY29uc3RydWN0b3JPYmouZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaW5qZWN0YWJsZS5kZXNjcmlwdGlvbiAmJiBpbmplY3RhYmxlLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBfLmZvckVhY2goaW5qZWN0YWJsZS5wcm9wZXJ0aWVzLCAocHJvcGVydHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5Lm1vZGlmaWVyS2luZCA9PT0gMTExKSB7IC8vIERvZXNuJ3QgaGFuZGxlIHByaXZhdGUgZm9yIGNvdmVyYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihwcm9wZXJ0eS5kZXNjcmlwdGlvbiAmJiBwcm9wZXJ0eS5kZXNjcmlwdGlvbiAhPT0gJycgJiYgcHJvcGVydHkubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKGluamVjdGFibGUubWV0aG9kcywgKG1ldGhvZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWV0aG9kLm1vZGlmaWVyS2luZCA9PT0gMTExKSB7IC8vIERvZXNuJ3QgaGFuZGxlIHByaXZhdGUgZm9yIGNvdmVyYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihtZXRob2QuZGVzY3JpcHRpb24gJiYgbWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJyAmJiBtZXRob2QubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgICAgICBpZih0b3RhbFN0YXRlbWVudHMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VDb3VudCA9IHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArICcvJyArIHRvdGFsU3RhdGVtZW50cztcbiAgICAgICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkICs9IGNsLmNvdmVyYWdlUGVyY2VudDtcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGNsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzLCAoaW50ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWludGVyLnByb3BlcnRpZXMgfHxcbiAgICAgICAgICAgICAgICAgICAgIWludGVyLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBjbDphbnkgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogaW50ZXIuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGludGVyLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rdHlwZTogaW50ZXIudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGludGVyLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gaW50ZXIucHJvcGVydGllcy5sZW5ndGggKyBpbnRlci5tZXRob2RzLmxlbmd0aCArIDE7IC8vICsxIGZvciBpbnRlcmZhY2UgaXRzZWxmXG5cbiAgICAgICAgICAgICAgICBpZiAoaW50ZXIuY29uc3RydWN0b3JPYmopIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnRlci5jb25zdHJ1Y3Rvck9iaiAmJiBpbnRlci5jb25zdHJ1Y3Rvck9iai5kZXNjcmlwdGlvbiAmJiBpbnRlci5jb25zdHJ1Y3Rvck9iai5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpbnRlci5kZXNjcmlwdGlvbiAmJiBpbnRlci5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKGludGVyLnByb3BlcnRpZXMsIChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkubW9kaWZpZXJLaW5kID09PSAxMTEpIHsgLy8gRG9lc24ndCBoYW5kbGUgcHJpdmF0ZSBmb3IgY292ZXJhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50cyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKHByb3BlcnR5LmRlc2NyaXB0aW9uICYmIHByb3BlcnR5LmRlc2NyaXB0aW9uICE9PSAnJyAmJiBwcm9wZXJ0eS5tb2RpZmllcktpbmQgIT09IDExMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2goaW50ZXIubWV0aG9kcywgKG1ldGhvZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWV0aG9kLm1vZGlmaWVyS2luZCA9PT0gMTExKSB7IC8vIERvZXNuJ3QgaGFuZGxlIHByaXZhdGUgZm9yIGNvdmVyYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihtZXRob2QuZGVzY3JpcHRpb24gJiYgbWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJyAmJiBtZXRob2QubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgICAgICBpZih0b3RhbFN0YXRlbWVudHMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VDb3VudCA9IHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArICcvJyArIHRvdGFsU3RhdGVtZW50cztcbiAgICAgICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkICs9IGNsLmNvdmVyYWdlUGVyY2VudDtcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGNsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlcywgKHBpcGUpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgY2w6YW55ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IHBpcGUuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHBpcGUudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmt0eXBlOiBwaXBlLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwaXBlLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gMTtcbiAgICAgICAgICAgICAgICBpZiAocGlwZS5kZXNjcmlwdGlvbiAmJiBwaXBlLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZUNvdW50ID0gdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICsgJy8nICsgdG90YWxTdGF0ZW1lbnRzO1xuICAgICAgICAgICAgICAgIGNsLnN0YXR1cyA9IGdldFN0YXR1cyhjbC5jb3ZlcmFnZVBlcmNlbnQpO1xuICAgICAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goY2wpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmaWxlcyA9IF8uc29ydEJ5KGZpbGVzLCBbJ2ZpbGVQYXRoJ10pO1xuICAgICAgICAgICAgdmFyIGNvdmVyYWdlRGF0YSA9IHtcbiAgICAgICAgICAgICAgICBjb3VudDogKGZpbGVzLmxlbmd0aCA+IDApID8gTWF0aC5mbG9vcih0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkIC8gZmlsZXMubGVuZ3RoKSA6IDAsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiAnJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvdmVyYWdlRGF0YS5zdGF0dXMgPSBnZXRTdGF0dXMoY292ZXJhZ2VEYXRhLmNvdW50KTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnY292ZXJhZ2UnLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdjb3ZlcmFnZScsXG4gICAgICAgICAgICAgICAgZmlsZXM6IGZpbGVzLFxuICAgICAgICAgICAgICAgIGRhdGE6IGNvdmVyYWdlRGF0YSxcbiAgICAgICAgICAgICAgICBkZXB0aDogMCxcbiAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5ST09UXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICRodG1sZW5naW5lLmdlbmVyYXRlQ292ZXJhZ2VCYWRnZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0LCBjb3ZlcmFnZURhdGEpO1xuICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb3ZlcmFnZVRlc3QpIHtcbiAgICAgICAgICAgICAgICBpZiAoY292ZXJhZ2VEYXRhLmNvdW50ID49IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb3ZlcmFnZVRlc3RUaHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ0RvY3VtZW50YXRpb24gY292ZXJhZ2UgaXMgb3ZlciB0aHJlc2hvbGQnKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRG9jdW1lbnRhdGlvbiBjb3ZlcmFnZSBpcyBub3Qgb3ZlciB0aHJlc2hvbGQnKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm9jZXNzUGFnZXMoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIHBhZ2VzJyk7XG4gICAgICAgIGxldCBwYWdlcyA9IHRoaXMuY29uZmlndXJhdGlvbi5wYWdlcztcbiAgICAgICAgUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICBwYWdlcy5tYXAoKHBhZ2UsIGkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyBwYWdlJywgcGFnZS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGh0bWxEYXRhID0gJGh0bWxlbmdpbmUucmVuZGVyKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YSwgcGFnZSlcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZpbmFsUGF0aCA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQ7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQubGFzdEluZGV4T2YoJy8nKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsUGF0aCArPSAnLyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhZ2UucGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxQYXRoICs9IHBhZ2UucGF0aCArICcvJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gcGFnZS5uYW1lICsgJy5odG1sJztcbiAgICAgICAgICAgICAgICAgICAgJHNlYXJjaEVuZ2luZS5pbmRleFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5mb3M6IHBhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICByYXdEYXRhOiBodG1sRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogZmluYWxQYXRoXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBmcy5vdXRwdXRGaWxlKHBhdGgucmVzb2x2ZShmaW5hbFBhdGgpLCBodG1sRGF0YSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nICcgKyBwYWdlLm5hbWUgKyAnIHBhZ2UgZ2VuZXJhdGlvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICRzZWFyY2hFbmdpbmUuZ2VuZXJhdGVTZWFyY2hJbmRleEpzb24odGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hZGRpdGlvbmFsUGFnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NBZGRpdGlvbmFsUGFnZXMoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlciAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0Fzc2V0c0ZvbGRlcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc1Jlc291cmNlcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIChlKSA9PiDCoHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByb2Nlc3NBZGRpdGlvbmFsUGFnZXMoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIGFkZGl0aW9uYWwgcGFnZXMnKTtcbiAgICAgICAgbGV0IHBhZ2VzID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFkZGl0aW9uYWxQYWdlc1xuICAgICAgICBQcm9taXNlLmFsbChcbiAgICAgICAgICAgIHBhZ2VzLm1hcCgocGFnZSwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIHBhZ2UnLCBwYWdlc1tpXS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGh0bWxEYXRhID0gJGh0bWxlbmdpbmUucmVuZGVyKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YSwgcGFnZXNbaV0pXG4gICAgICAgICAgICAgICAgICAgIGxldCBmaW5hbFBhdGggPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0Lmxhc3RJbmRleE9mKCcvJykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gJy8nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYWdlc1tpXS5wYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gcGFnZXNbaV0ucGF0aCArICcvJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gcGFnZXNbaV0ubmFtZSArICcuaHRtbCc7XG4gICAgICAgICAgICAgICAgICAgICRzZWFyY2hFbmdpbmUuaW5kZXhQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm9zOiBwYWdlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhd0RhdGE6IGh0bWxEYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBmaW5hbFBhdGhcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGZzLm91dHB1dEZpbGUocGF0aC5yZXNvbHZlKGZpbmFsUGF0aCksIGh0bWxEYXRhLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgJyArIHBhZ2VzW2ldLm5hbWUgKyAnIHBhZ2UgZ2VuZXJhdGlvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICRzZWFyY2hFbmdpbmUuZ2VuZXJhdGVTZWFyY2hJbmRleEpzb24odGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0Fzc2V0c0ZvbGRlcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NSZXNvdXJjZXMoKTtcbiAgICAgICAgICAgIH0sIChlKSA9PsKge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc0Fzc2V0c0ZvbGRlcigpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ0NvcHkgYXNzZXRzIGZvbGRlcicpO1xuXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyKSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBQcm92aWRlZCBhc3NldHMgZm9sZGVyICR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlcn0gZGlkIG5vdCBleGlzdGApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnMuY29weShwYXRoLnJlc29sdmUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlciksIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0ICsgcGF0aC5zZXAgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyKSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyByZXNvdXJjZXMgY29weSAnLCBlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvY2Vzc1Jlc291cmNlcygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ0NvcHkgbWFpbiByZXNvdXJjZXMnKTtcblxuICAgICAgICBjb25zdCBvbkNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGZpbmFsVGltZSA9IChuZXcgRGF0ZSgpIC0gc3RhcnRUaW1lKSAvIDEwMDA7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnRG9jdW1lbnRhdGlvbiBnZW5lcmF0ZWQgaW4gJyArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQgKyAnIGluICcgKyBmaW5hbFRpbWUgKyAnIHNlY29uZHMgdXNpbmcgJyArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50aGVtZSArICcgdGhlbWUnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuc2VydmUpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgU2VydmluZyBkb2N1bWVudGF0aW9uIGZyb20gJHt0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0fSBhdCBodHRwOi8vMTI3LjAuMC4xOiR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBvcnR9YCk7XG4gICAgICAgICAgICAgICAgdGhpcy5ydW5XZWJTZXJ2ZXIodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGZpbmFsT3V0cHV0ID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKTtcblxuICAgICAgICBmcy5jb3B5KHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy9yZXNvdXJjZXMvJyksIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyBmaW5hbE91dHB1dCksIChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nIHJlc291cmNlcyBjb3B5ICcsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmV4dFRoZW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGZzLmNvcHkocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5leHRUaGVtZSksIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyBmaW5hbE91dHB1dCArICcvc3R5bGVzLycpLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgZXh0ZXJuYWwgc3R5bGluZyB0aGVtZSBjb3B5ICcsIGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdFeHRlcm5hbCBzdHlsaW5nIHRoZW1lIGNvcHkgc3VjY2VlZGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Db21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByb2Nlc3NHcmFwaHMoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlR3JhcGgpIHtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdHcmFwaCBnZW5lcmF0aW9uIGRpc2FibGVkJyk7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NQYWdlcygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3MgbWFpbiBncmFwaCcpO1xuXG4gICAgICAgICAgICBsZXQgZmluYWxNYWluR3JhcGhQYXRoID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dDtcbiAgICAgICAgICAgIGlmKGZpbmFsTWFpbkdyYXBoUGF0aC5sYXN0SW5kZXhPZignLycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGZpbmFsTWFpbkdyYXBoUGF0aCArPSAnLyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbE1haW5HcmFwaFBhdGggKz0gJ2dyYXBoJztcbiAgICAgICAgICAgICRuZ2RlbmdpbmUucmVuZGVyR3JhcGgodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnLCBwYXRoLnJlc29sdmUoZmluYWxNYWluR3JhcGhQYXRoKSwgJ3AnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAkbmdkZW5naW5lLnJlYWRHcmFwaChwYXRoLnJlc29sdmUoZmluYWxNYWluR3JhcGhQYXRoICsgcGF0aC5zZXAgKyAnZGVwZW5kZW5jaWVzLnN2ZycpLCAnTWFpbiBncmFwaCcpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1haW5HcmFwaCA9IDxzdHJpbmc+ZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVNb2R1bGVzR3JhcGgoKTtcbiAgICAgICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nIGdyYXBoIHJlYWQ6ICcsIGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgZ3JhcGggZ2VuZXJhdGlvbjogJywgZXJyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgbW9kdWxlcyA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzLFxuICAgICAgICAgICAgICAgIGdlbmVyYXRlTW9kdWxlc0dyYXBoID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBQcm9taXNlLmFsbChcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZXMubWFwKChtb2R1bGUsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyBtb2R1bGUgZ3JhcGgnLCBtb2R1bGVzW2ldLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmluYWxQYXRoID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dC5sYXN0SW5kZXhPZignLycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxQYXRoICs9ICcvJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gJ21vZHVsZXMvJyArIG1vZHVsZXNbaV0ubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJG5nZGVuZ2luZS5yZW5kZXJHcmFwaChtb2R1bGVzW2ldLmZpbGUsIGZpbmFsUGF0aCwgJ2YnLCBtb2R1bGVzW2ldLm5hbWUpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJG5nZGVuZ2luZS5yZWFkR3JhcGgocGF0aC5yZXNvbHZlKGZpbmFsUGF0aCArIHBhdGguc2VwICsgJ2RlcGVuZGVuY2llcy5zdmcnKSwgbW9kdWxlc1tpXS5uYW1lKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlc1tpXS5ncmFwaCA9IDxzdHJpbmc+ZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgZ3JhcGggcmVhZDogJywgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NQYWdlcygpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcnVuV2ViU2VydmVyKGZvbGRlcikge1xuICAgICAgICBpZighdGhpcy5pc1dhdGNoaW5nKSB7XG4gICAgICAgICAgICBMaXZlU2VydmVyLnN0YXJ0KHtcbiAgICAgICAgICAgICAgICByb290OiBmb2xkZXIsXG4gICAgICAgICAgICAgICAgb3BlbjogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm9wZW4sXG4gICAgICAgICAgICAgICAgcXVpZXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgbG9nTGV2ZWw6IDAsXG4gICAgICAgICAgICAgICAgd2FpdDogMTAwMCxcbiAgICAgICAgICAgICAgICBwb3J0OiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucG9ydFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS53YXRjaCAmJiAhdGhpcy5pc1dhdGNoaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnJ1bldhdGNoKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLndhdGNoICYmIHRoaXMuaXNXYXRjaGluZykge1xuICAgICAgICAgICAgbGV0IHNyY0ZvbGRlciA9IGZpbmRNYWluU291cmNlRm9sZGVyKHRoaXMuZmlsZXMpO1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oYEFscmVhZHkgd2F0Y2hpbmcgc291cmNlcyBpbiAke3NyY0ZvbGRlcn0gZm9sZGVyYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBydW5XYXRjaCgpIHtcbiAgICAgICAgbGV0IHNvdXJjZXMgPSBbZmluZE1haW5Tb3VyY2VGb2xkZXIodGhpcy5maWxlcyldLFxuICAgICAgICAgICAgd2F0Y2hlclJlYWR5ID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5pc1dhdGNoaW5nID0gdHJ1ZTtcblxuICAgICAgICBsb2dnZXIuaW5mbyhgV2F0Y2hpbmcgc291cmNlcyBpbiAke2ZpbmRNYWluU291cmNlRm9sZGVyKHRoaXMuZmlsZXMpfSBmb2xkZXJgKTtcblxuICAgICAgICBpZiAoJG1hcmtkb3duZW5naW5lLmhhc1Jvb3RNYXJrZG93bnMoKSkge1xuICAgICAgICAgICAgc291cmNlcyA9IHNvdXJjZXMuY29uY2F0KCRtYXJrZG93bmVuZ2luZS5saXN0Um9vdE1hcmtkb3ducygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgIT09ICcnKSB7XG4gICAgICAgICAgICBzb3VyY2VzID0gc291cmNlcy5jb25jYXQodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluY2x1ZGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB3YXRjaGVyID0gY2hva2lkYXIud2F0Y2goc291cmNlcywge1xuICAgICAgICAgICAgICAgIGF3YWl0V3JpdGVGaW5pc2g6IHRydWUsXG4gICAgICAgICAgICAgICAgaWdub3JlSW5pdGlhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpZ25vcmVkOiAvKHNwZWN8XFwuZClcXC50cy9cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgdGltZXJBZGRBbmRSZW1vdmVSZWYsXG4gICAgICAgICAgICB0aW1lckNoYW5nZVJlZixcbiAgICAgICAgICAgIHdhaXRlckFkZEFuZFJlbW92ZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXJBZGRBbmRSZW1vdmVSZWYpO1xuICAgICAgICAgICAgICAgIHRpbWVyQWRkQW5kUmVtb3ZlUmVmID0gc2V0VGltZW91dChydW5uZXJBZGRBbmRSZW1vdmUsIDEwMDApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJ1bm5lckFkZEFuZFJlbW92ZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGUoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3YWl0ZXJDaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyQ2hhbmdlUmVmKTtcbiAgICAgICAgICAgICAgICB0aW1lckNoYW5nZVJlZiA9IHNldFRpbWVvdXQocnVubmVyQ2hhbmdlLCAxMDAwKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBydW5uZXJDaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZWRGaWxlcyh0aGlzLndhdGNoQ2hhbmdlZEZpbGVzKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5oYXNXYXRjaGVkRmlsZXNUU0ZpbGVzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRNaWNyb0RlcGVuZGVuY2llc0RhdGEoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzV2F0Y2hlZEZpbGVzUm9vdE1hcmtkb3duRmlsZXMoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYnVpbGRSb290TWFya2Rvd25zKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWJ1aWxkRXh0ZXJuYWxEb2N1bWVudGF0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICB3YXRjaGVyXG4gICAgICAgICAgICAub24oJ3JlYWR5JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghd2F0Y2hlclJlYWR5KSB7XG4gICAgICAgICAgICAgICAgICAgIHdhdGNoZXJSZWFkeSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHdhdGNoZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vbignYWRkJywgKGZpbGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoYEZpbGUgJHtmaWxlfSBoYXMgYmVlbiBhZGRlZGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRlc3QgZXh0ZW5zaW9uLCBpZiB0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlc2NhbiBldmVyeXRoaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhdGguZXh0bmFtZShmaWxlKSA9PT0gJy50cycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2FpdGVyQWRkQW5kUmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vbignY2hhbmdlJywgKGZpbGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoYEZpbGUgJHtmaWxlfSBoYXMgYmVlbiBjaGFuZ2VkYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGVzdCBleHRlbnNpb24sIGlmIHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVzY2FuIG9ubHkgZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXRoLmV4dG5hbWUoZmlsZSkgPT09ICcudHMnIHx8IHBhdGguZXh0bmFtZShmaWxlKSA9PT0gJy5tZCcgfHwgcGF0aC5leHRuYW1lKGZpbGUpID09PSAnLmpzb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMud2F0Y2hDaGFuZ2VkRmlsZXMucHVzaChwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgZmlsZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YWl0ZXJDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCd1bmxpbmsnLCAoZmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgRmlsZSAke2ZpbGV9IGhhcyBiZWVuIHJlbW92ZWRgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUZXN0IGV4dGVuc2lvbiwgaWYgdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXNjYW4gZXZlcnl0aGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXRoLmV4dG5hbWUoZmlsZSkgPT09ICcudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhaXRlckFkZEFuZFJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgYXBwbGljYXRpb24gLyByb290IGNvbXBvbmVudCBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICBnZXQgYXBwbGljYXRpb24oKTpBcHBsaWNhdGlvbiB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuXG4gICAgZ2V0IGlzQ0xJKCk6Ym9vbGVhbiB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQgeyBBcHBsaWNhdGlvbiB9IGZyb20gJy4vYXBwL2FwcGxpY2F0aW9uJztcblxuaW1wb3J0IHsgQ09NUE9ET0NfREVGQVVMVFMgfSBmcm9tICcuL3V0aWxzL2RlZmF1bHRzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4vbG9nZ2VyJztcbmltcG9ydCB7IHJlYWRDb25maWcsIGhhbmRsZVBhdGggfSBmcm9tICcuL3V0aWxzL3V0aWxzJztcblxubGV0IHBrZyA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLFxuICAgIHByb2dyYW0gPSByZXF1aXJlKCdjb21tYW5kZXInKSxcbiAgICBfID0gcmVxdWlyZSgnbG9kYXNoJyksXG4gICAgZ2xvYiA9IHJlcXVpcmUoJ2dsb2InKSxcbiAgICBvcyA9IHJlcXVpcmUoJ29zJyksXG4gICAgb3NOYW1lID0gcmVxdWlyZSgnb3MtbmFtZScpLFxuICAgIGZpbGVzID0gW10sXG4gICAgY3dkID0gcHJvY2Vzcy5jd2QoKTtcblxucHJvY2Vzcy5zZXRNYXhMaXN0ZW5lcnMoMCk7XG5cbnByb2Nlc3Mub24oJ3VuaGFuZGxlZFJlamVjdGlvbicsIChlcnIpID0+IHtcbiAgICBsb2dnZXIuZXJyb3IoZXJyKTtcbiAgICBsb2dnZXIuZXJyb3IoJ1NvcnJ5LCBidXQgdGhlcmUgd2FzIGEgcHJvYmxlbSBkdXJpbmcgcGFyc2luZyBvciBnZW5lcmF0aW9uIG9mIHRoZSBkb2N1bWVudGF0aW9uLiBQbGVhc2UgZmlsbCBhbiBpc3N1ZSBvbiBnaXRodWIuIChodHRwczovL2dpdGh1Yi5jb20vY29tcG9kb2MvY29tcG9kb2MvaXNzdWVzL25ldyknKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG59KTtcblxucHJvY2Vzcy5vbigndW5jYXVnaHRFeGNlcHRpb24nLCAoZXJyKSA9PiB7XG4gICAgbG9nZ2VyLmVycm9yKGVycik7XG4gICAgbG9nZ2VyLmVycm9yKCdTb3JyeSwgYnV0IHRoZXJlIHdhcyBhIHByb2JsZW0gZHVyaW5nIHBhcnNpbmcgb3IgZ2VuZXJhdGlvbiBvZiB0aGUgZG9jdW1lbnRhdGlvbi4gUGxlYXNlIGZpbGwgYW4gaXNzdWUgb24gZ2l0aHViLiAoaHR0cHM6Ly9naXRodWIuY29tL2NvbXBvZG9jL2NvbXBvZG9jL2lzc3Vlcy9uZXcpJyk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xufSk7XG5cbmV4cG9ydCBjbGFzcyBDbGlBcHBsaWNhdGlvbiBleHRlbmRzIEFwcGxpY2F0aW9uXG57XG4gICAgLyoqXG4gICAgICogUnVuIGNvbXBvZG9jIGZyb20gdGhlIGNvbW1hbmQgbGluZS5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2VuZXJhdGUoKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gbGlzdCh2YWwpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWwuc3BsaXQoJywnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb2dyYW1cbiAgICAgICAgICAgIC52ZXJzaW9uKHBrZy52ZXJzaW9uKVxuICAgICAgICAgICAgLnVzYWdlKCc8c3JjPiBbb3B0aW9uc10nKVxuICAgICAgICAgICAgLm9wdGlvbignLXAsIC0tdHNjb25maWcgW2NvbmZpZ10nLCAnQSB0c2NvbmZpZy5qc29uIGZpbGUnKVxuICAgICAgICAgICAgLm9wdGlvbignLWQsIC0tb3V0cHV0IFtmb2xkZXJdJywgJ1doZXJlIHRvIHN0b3JlIHRoZSBnZW5lcmF0ZWQgZG9jdW1lbnRhdGlvbiAoZGVmYXVsdDogLi9kb2N1bWVudGF0aW9uKScsIENPTVBPRE9DX0RFRkFVTFRTLmZvbGRlcilcbiAgICAgICAgICAgIC5vcHRpb24oJy15LCAtLWV4dFRoZW1lIFtmaWxlXScsICdFeHRlcm5hbCBzdHlsaW5nIHRoZW1lIGZpbGUnKVxuICAgICAgICAgICAgLm9wdGlvbignLW4sIC0tbmFtZSBbbmFtZV0nLCAnVGl0bGUgZG9jdW1lbnRhdGlvbicsIENPTVBPRE9DX0RFRkFVTFRTLnRpdGxlKVxuICAgICAgICAgICAgLm9wdGlvbignLWEsIC0tYXNzZXRzRm9sZGVyIFtmb2xkZXJdJywgJ0V4dGVybmFsIGFzc2V0cyBmb2xkZXIgdG8gY29weSBpbiBnZW5lcmF0ZWQgZG9jdW1lbnRhdGlvbiBmb2xkZXInKVxuICAgICAgICAgICAgLm9wdGlvbignLW8sIC0tb3BlbicsICdPcGVuIHRoZSBnZW5lcmF0ZWQgZG9jdW1lbnRhdGlvbicsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLXQsIC0tc2lsZW50JywgJ0luIHNpbGVudCBtb2RlLCBsb2cgbWVzc2FnZXMgYXJlblxcJ3QgbG9nZ2VkIGluIHRoZSBjb25zb2xlJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctcywgLS1zZXJ2ZScsICdTZXJ2ZSBnZW5lcmF0ZWQgZG9jdW1lbnRhdGlvbiAoZGVmYXVsdCBodHRwOi8vbG9jYWxob3N0OjgwODAvKScsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLXIsIC0tcG9ydCBbcG9ydF0nLCAnQ2hhbmdlIGRlZmF1bHQgc2VydmluZyBwb3J0JywgQ09NUE9ET0NfREVGQVVMVFMucG9ydClcbiAgICAgICAgICAgIC5vcHRpb24oJy13LCAtLXdhdGNoJywgJ1dhdGNoIHNvdXJjZSBmaWxlcyBhZnRlciBzZXJ2ZSBhbmQgZm9yY2UgZG9jdW1lbnRhdGlvbiByZWJ1aWxkJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctLXRoZW1lIFt0aGVtZV0nLCAnQ2hvb3NlIG9uZSBvZiBhdmFpbGFibGUgdGhlbWVzLCBkZWZhdWx0IGlzIFxcJ2dpdGJvb2tcXCcgKGxhcmF2ZWwsIG9yaWdpbmFsLCBwb3N0bWFyaywgcmVhZHRoZWRvY3MsIHN0cmlwZSwgdmFncmFudCknKVxuICAgICAgICAgICAgLm9wdGlvbignLS1oaWRlR2VuZXJhdG9yJywgJ0RvIG5vdCBwcmludCB0aGUgQ29tcG9kb2MgbGluayBhdCB0aGUgYm90dG9tIG9mIHRoZSBwYWdlJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctLXRvZ2dsZU1lbnVJdGVtcyA8aXRlbXM+JywgJ0Nsb3NlIGJ5IGRlZmF1bHQgaXRlbXMgaW4gdGhlIG1lbnUgKGRlZmF1bHQgW1xcJ2FsbFxcJ10pIHZhbHVlcyA6IFtcXCdhbGxcXCddIG9yIG9uZSBvZiB0aGVzZSBbXFwnbW9kdWxlc1xcJyxcXCdjb21wb25lbnRzXFwnLFxcJ2RpcmVjdGl2ZXNcXCcsXFwnY2xhc3Nlc1xcJyxcXCdpbmplY3RhYmxlc1xcJyxcXCdpbnRlcmZhY2VzXFwnLFxcJ3BpcGVzXFwnLFxcJ2FkZGl0aW9uYWxQYWdlc1xcJ10nLCBsaXN0LCBDT01QT0RPQ19ERUZBVUxUUy50b2dnbGVNZW51SXRlbXMpXG4gICAgICAgICAgICAub3B0aW9uKCctLWluY2x1ZGVzIFtwYXRoXScsICdQYXRoIG9mIGV4dGVybmFsIG1hcmtkb3duIGZpbGVzIHRvIGluY2x1ZGUnKVxuICAgICAgICAgICAgLm9wdGlvbignLS1pbmNsdWRlc05hbWUgW25hbWVdJywgJ05hbWUgb2YgaXRlbSBtZW51IG9mIGV4dGVybmFscyBtYXJrZG93biBmaWxlcyAoZGVmYXVsdCBcIkFkZGl0aW9uYWwgZG9jdW1lbnRhdGlvblwiKScsIENPTVBPRE9DX0RFRkFVTFRTLmFkZGl0aW9uYWxFbnRyeU5hbWUpXG4gICAgICAgICAgICAub3B0aW9uKCctLWNvdmVyYWdlVGVzdCBbdGhyZXNob2xkXScsICdUZXN0IGNvbW1hbmQgb2YgZG9jdW1lbnRhdGlvbiBjb3ZlcmFnZSB3aXRoIGEgdGhyZXNob2xkIChkZWZhdWx0IDcwKScpXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGVTb3VyY2VDb2RlJywgJ0RvIG5vdCBhZGQgc291cmNlIGNvZGUgdGFiIGFuZCBsaW5rcyB0byBzb3VyY2UgY29kZScsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLS1kaXNhYmxlR3JhcGgnLCAnRG8gbm90IGFkZCB0aGUgZGVwZW5kZW5jeSBncmFwaCcsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLS1kaXNhYmxlQ292ZXJhZ2UnLCAnRG8gbm90IGFkZCB0aGUgZG9jdW1lbnRhdGlvbiBjb3ZlcmFnZSByZXBvcnQnLCBmYWxzZSlcbiAgICAgICAgICAgIC5vcHRpb24oJy0tZGlzYWJsZVByaXZhdGVPckludGVybmFsU3VwcG9ydCcsICdEbyBub3Qgc2hvdyBwcml2YXRlLCBAaW50ZXJuYWwgb3IgQW5ndWxhciBsaWZlY3ljbGUgaG9va3MgaW4gZ2VuZXJhdGVkIGRvY3VtZW50YXRpb24nLCBmYWxzZSlcbiAgICAgICAgICAgIC5wYXJzZShwcm9jZXNzLmFyZ3YpO1xuXG4gICAgICAgIGxldCBvdXRwdXRIZWxwID0gKCkgPT4ge1xuICAgICAgICAgICAgcHJvZ3JhbS5vdXRwdXRIZWxwKClcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLm91dHB1dCkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCA9IHByb2dyYW0ub3V0cHV0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uZXh0VGhlbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5leHRUaGVtZSA9IHByb2dyYW0uZXh0VGhlbWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS50aGVtZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRoZW1lID0gcHJvZ3JhbS50aGVtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLm5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kb2N1bWVudGF0aW9uTWFpbk5hbWUgPSBwcm9ncmFtLm5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5hc3NldHNGb2xkZXIpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIgPSBwcm9ncmFtLmFzc2V0c0ZvbGRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLm9wZW4pIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vcGVuID0gcHJvZ3JhbS5vcGVuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0udG9nZ2xlTWVudUl0ZW1zKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudG9nZ2xlTWVudUl0ZW1zID0gcHJvZ3JhbS50b2dnbGVNZW51SXRlbXM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5pbmNsdWRlcykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluY2x1ZGVzICA9IHByb2dyYW0uaW5jbHVkZXM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5pbmNsdWRlc05hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlc05hbWUgID0gcHJvZ3JhbS5pbmNsdWRlc05hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5zaWxlbnQpIHtcbiAgICAgICAgICAgIGxvZ2dlci5zaWxlbnQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLnNlcnZlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuc2VydmUgID0gcHJvZ3JhbS5zZXJ2ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLnBvcnQpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5wb3J0ID0gcHJvZ3JhbS5wb3J0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0ud2F0Y2gpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS53YXRjaCA9IHByb2dyYW0ud2F0Y2g7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5oaWRlR2VuZXJhdG9yKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaGlkZUdlbmVyYXRvciA9IHByb2dyYW0uaGlkZUdlbmVyYXRvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmluY2x1ZGVzKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgPSBwcm9ncmFtLmluY2x1ZGVzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uaW5jbHVkZXNOYW1lKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXNOYW1lID0gcHJvZ3JhbS5pbmNsdWRlc05hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5jb3ZlcmFnZVRlc3QpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb3ZlcmFnZVRlc3QgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvdmVyYWdlVGVzdFRocmVzaG9sZCA9ICh0eXBlb2YgcHJvZ3JhbS5jb3ZlcmFnZVRlc3QgPT09ICdzdHJpbmcnKSA/IHBhcnNlSW50KHByb2dyYW0uY292ZXJhZ2VUZXN0KSA6IENPTVBPRE9DX0RFRkFVTFRTLmRlZmF1bHRDb3ZlcmFnZVRocmVzaG9sZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmRpc2FibGVTb3VyY2VDb2RlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZVNvdXJjZUNvZGUgPSBwcm9ncmFtLmRpc2FibGVTb3VyY2VDb2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uZGlzYWJsZUdyYXBoKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUdyYXBoID0gcHJvZ3JhbS5kaXNhYmxlR3JhcGg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5kaXNhYmxlQ292ZXJhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlQ292ZXJhZ2UgPSBwcm9ncmFtLmRpc2FibGVDb3ZlcmFnZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmRpc2FibGVQcml2YXRlT3JJbnRlcm5hbFN1cHBvcnQpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlUHJpdmF0ZU9ySW50ZXJuYWxTdXBwb3J0ID0gcHJvZ3JhbS5kaXNhYmxlUHJpdmF0ZU9ySW50ZXJuYWxTdXBwb3J0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzV2F0Y2hpbmcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vc3JjL3Jlc291cmNlcy9pbWFnZXMvYmFubmVyJykpLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocGtnLnZlcnNpb24pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE5vZGUuanMgdmVyc2lvbiA6ICR7cHJvY2Vzcy52ZXJzaW9ufWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE9wZXJhdGluZyBzeXN0ZW0gOiAke29zTmFtZShvcy5wbGF0Zm9ybSgpLCBvcy5yZWxlYXNlKCkpfWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uc2VydmUgJiYgIXByb2dyYW0udHNjb25maWcgJiYgcHJvZ3JhbS5vdXRwdXQpIHtcbiAgICAgICAgICAgIC8vIGlmIC1zICYgLWQsIHNlcnZlIGl0XG4gICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMocHJvZ3JhbS5vdXRwdXQpKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGAke3Byb2dyYW0ub3V0cHV0fSBmb2xkZXIgZG9lc24ndCBleGlzdGApO1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYFNlcnZpbmcgZG9jdW1lbnRhdGlvbiBmcm9tICR7cHJvZ3JhbS5vdXRwdXR9IGF0IGh0dHA6Ly8xMjcuMC4wLjE6JHtwcm9ncmFtLnBvcnR9YCk7XG4gICAgICAgICAgICAgICAgc3VwZXIucnVuV2ViU2VydmVyKHByb2dyYW0ub3V0cHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwcm9ncmFtLnNlcnZlICYmICFwcm9ncmFtLnRzY29uZmlnICYmICFwcm9ncmFtLm91dHB1dCkge1xuICAgICAgICAgICAgLy8gaWYgb25seSAtcyBmaW5kIC4vZG9jdW1lbnRhdGlvbiwgaWYgb2sgc2VydmUsIGVsc2UgZXJyb3IgcHJvdmlkZSAtZFxuICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHByb2dyYW0ub3V0cHV0KSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignUHJvdmlkZSBvdXRwdXQgZ2VuZXJhdGVkIGZvbGRlciB3aXRoIC1kIGZsYWcnKTtcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBTZXJ2aW5nIGRvY3VtZW50YXRpb24gZnJvbSAke3Byb2dyYW0ub3V0cHV0fSBhdCBodHRwOi8vMTI3LjAuMC4xOiR7cHJvZ3JhbS5wb3J0fWApO1xuICAgICAgICAgICAgICAgIHN1cGVyLnJ1bldlYlNlcnZlcihwcm9ncmFtLm91dHB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAocHJvZ3JhbS5oaWRlR2VuZXJhdG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmhpZGVHZW5lcmF0b3IgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgZGVmYXVsdFdhbGtGT2xkZXIgPSBjd2QgfHwgJy4nLFxuICAgICAgICAgICAgICAgIHdhbGsgPSAoZGlyLCBleGNsdWRlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZXN1bHRzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGxldCBsaXN0ID0gZnMucmVhZGRpclN5bmMoZGlyKTtcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXhjbHVkZVRlc3QgPSBfLmZpbmQoZXhjbHVkZSwgZnVuY3Rpb24obykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBnbG9iRmlsZXMgPSBnbG9iLnN5bmMobywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjd2Q6IGN3ZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChnbG9iRmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmlsZU5hbWVGb3JHbG9iU2VhcmNoID0gcGF0aC5qb2luKGRpciwgZmlsZSkucmVwbGFjZShjd2QgKyBwYXRoLnNlcCwgJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0R2xvYlNlYXJjaCA9IGdsb2JGaWxlcy5maW5kSW5kZXgoKGVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudCA9PT0gZmlsZU5hbWVGb3JHbG9iU2VhcmNoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0ID0gcmVzdWx0R2xvYlNlYXJjaCAhPT0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIud2FybignRXhjbHVkaW5nJywgcGF0aC5qb2luKGRpciwgZmlsZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0ZXN0ID0gcGF0aC5iYXNlbmFtZShvKSA9PT0gZmlsZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKCdFeGNsdWRpbmcnLCBwYXRoLmpvaW4oZGlyLCBmaWxlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRlc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGV4Y2x1ZGVUZXN0ID09PSAndW5kZWZpbmVkJyAmJiBkaXIuaW5kZXhPZignbm9kZV9tb2R1bGVzJykgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZSA9IHBhdGguam9pbihkaXIsIGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdGF0ID0gZnMuc3RhdFN5bmMoZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXQgJiYgc3RhdC5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdCh3YWxrKGZpbGUsIGV4Y2x1ZGUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoLyhzcGVjfFxcLmQpXFwudHMvLnRlc3QoZmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oJ0lnbm9yaW5nJywgZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHBhdGguZXh0bmFtZShmaWxlKSA9PT0gJy50cycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdJbmNsdWRpbmcnLCBmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChwcm9ncmFtLnRzY29uZmlnICYmIHByb2dyYW0uYXJncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcgPSBwcm9ncmFtLnRzY29uZmlnO1xuICAgICAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwcm9ncmFtLnRzY29uZmlnKSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYFwiJHtwcm9ncmFtLnRzY29uZmlnfVwiIGZpbGUgd2FzIG5vdCBmb3VuZCBpbiB0aGUgY3VycmVudCBkaXJlY3RvcnlgKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBfZmlsZSA9IHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBwYXRoLmRpcm5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoLmJhc2VuYW1lKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZylcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdXNlIHRoZSBjdXJyZW50IGRpcmVjdG9yeSBvZiB0c2NvbmZpZy5qc29uIGFzIGEgd29ya2luZyBkaXJlY3RvcnlcbiAgICAgICAgICAgICAgICAgICAgY3dkID0gX2ZpbGUuc3BsaXQocGF0aC5zZXApLnNsaWNlKDAsIC0xKS5qb2luKHBhdGguc2VwKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1VzaW5nIHRzY29uZmlnJywgX2ZpbGUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCB0c0NvbmZpZ0ZpbGUgPSByZWFkQ29uZmlnKF9maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgZmlsZXMgPSB0c0NvbmZpZ0ZpbGUuZmlsZXM7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMgPSBoYW5kbGVQYXRoKGZpbGVzLCBjd2QpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmaWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4Y2x1ZGUgPSB0c0NvbmZpZ0ZpbGUuZXhjbHVkZSB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzID0gd2Fsayhjd2QgfHwgJy4nLCBleGNsdWRlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHN1cGVyLnNldEZpbGVzKGZpbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgc3VwZXIuZ2VuZXJhdGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ICBlbHNlIGlmIChwcm9ncmFtLnRzY29uZmlnICYmIHByb2dyYW0uYXJncy5sZW5ndGggPiAwICYmIHByb2dyYW0uY292ZXJhZ2VUZXN0KSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1J1biBkb2N1bWVudGF0aW9uIGNvdmVyYWdlIHRlc3QnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcgPSBwcm9ncmFtLnRzY29uZmlnO1xuICAgICAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwcm9ncmFtLnRzY29uZmlnKSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYFwiJHtwcm9ncmFtLnRzY29uZmlnfVwiIGZpbGUgd2FzIG5vdCBmb3VuZCBpbiB0aGUgY3VycmVudCBkaXJlY3RvcnlgKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBfZmlsZSA9IHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgICBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgcGF0aC5kaXJuYW1lKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZykpLFxuICAgICAgICAgICAgICAgICAgICAgIHBhdGguYmFzZW5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAvLyB1c2UgdGhlIGN1cnJlbnQgZGlyZWN0b3J5IG9mIHRzY29uZmlnLmpzb24gYXMgYSB3b3JraW5nIGRpcmVjdG9yeVxuICAgICAgICAgICAgICAgICAgICBjd2QgPSBfZmlsZS5zcGxpdChwYXRoLnNlcCkuc2xpY2UoMCwgLTEpLmpvaW4ocGF0aC5zZXApO1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnVXNpbmcgdHNjb25maWcnLCBfZmlsZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IHRzQ29uZmlnRmlsZSA9IHJlYWRDb25maWcoX2ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IHRzQ29uZmlnRmlsZS5maWxlcztcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IGhhbmRsZVBhdGgoZmlsZXMsIGN3ZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWZpbGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXhjbHVkZSA9IHRzQ29uZmlnRmlsZS5leGNsdWRlIHx8IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IHdhbGsoY3dkIHx8ICcuJywgZXhjbHVkZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzdXBlci5zZXRGaWxlcyhmaWxlcyk7XG4gICAgICAgICAgICAgICAgICAgIHN1cGVyLnRlc3RDb3ZlcmFnZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvZ3JhbS50c2NvbmZpZyAmJiBwcm9ncmFtLmFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZyA9IHByb2dyYW0udHNjb25maWc7XG4gICAgICAgICAgICAgICAgbGV0IHNvdXJjZUZvbGRlciA9IHByb2dyYW0uYXJnc1swXTtcbiAgICAgICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoc291cmNlRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYFByb3ZpZGVkIHNvdXJjZSBmb2xkZXIgJHtzb3VyY2VGb2xkZXJ9IHdhcyBub3QgZm91bmQgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5YCk7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnVXNpbmcgcHJvdmlkZWQgc291cmNlIGZvbGRlcicpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwcm9ncmFtLnRzY29uZmlnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBcIiR7cHJvZ3JhbS50c2NvbmZpZ31cIiBmaWxlIHdhcyBub3QgZm91bmQgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdHNDb25maWdGaWxlID0gcmVhZENvbmZpZyhwcm9ncmFtLnRzY29uZmlnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBleGNsdWRlID0gdHNDb25maWdGaWxlLmV4Y2x1ZGUgfHwgW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzID0gd2FsayhwYXRoLnJlc29sdmUoc291cmNlRm9sZGVyKSwgZXhjbHVkZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHN1cGVyLnNldEZpbGVzKGZpbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1cGVyLmdlbmVyYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcigndHNjb25maWcuanNvbiBmaWxlIHdhcyBub3QgZm91bmQsIHBsZWFzZSB1c2UgLXAgZmxhZycpO1xuICAgICAgICAgICAgICAgIG91dHB1dEhlbHAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJuYW1lcyI6WyJwa2ciLCJfIiwiSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciIsIkhhbmRsZWJhcnMuVXRpbHMiLCJIYW5kbGViYXJzLlNhZmVTdHJpbmciLCJwYXRoIiwicmVzb2x2ZSIsImZzLnJlYWRGaWxlIiwicGF0aC5yZXNvbHZlIiwiSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwiLCJIYW5kbGViYXJzLmNvbXBpbGUiLCJmcy5vdXRwdXRGaWxlIiwicGF0aC5zZXAiLCJtYXJrZWQiLCJkaXJuYW1lIiwicGF0aC5kaXJuYW1lIiwicGF0aC5iYXNlbmFtZSIsImZzLmV4aXN0c1N5bmMiLCJ0cyIsInBhdGguaXNBYnNvbHV0ZSIsInBhdGguam9pbiIsImZzLnJlYWRGaWxlU3luYyIsInNlcCIsInBhdGguZXh0bmFtZSIsImZzLmNvcHkiLCJMaXZlU2VydmVyLnN0YXJ0IiwiZ2xvYiIsImN3ZCIsImZzLnJlYWRkaXJTeW5jIiwiZnMuc3RhdFN5bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUNoQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQ3JCLElBQUlBLEtBQUcsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUVyQyxJQUFLLEtBS0o7QUFMRCxXQUFLLEtBQUs7SUFDVCxpQ0FBSSxDQUFBO0lBQ0osbUNBQUssQ0FBQTtJQUNGLG1DQUFLLENBQUE7SUFDTCxpQ0FBSSxDQUFBO0NBQ1AsRUFMSSxLQUFLLEtBQUwsS0FBSyxRQUtUO0FBRUQ7SUFPQztRQUNDLElBQUksQ0FBQyxJQUFJLEdBQUdBLEtBQUcsQ0FBQyxJQUFJLENBQUM7UUFDckIsSUFBSSxDQUFDLE9BQU8sR0FBR0EsS0FBRyxDQUFDLE9BQU8sQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7S0FDbkI7SUFFRCxxQkFBSSxHQUFKO1FBQUssY0FBTzthQUFQLFVBQU8sRUFBUCxxQkFBTyxFQUFQLElBQU87WUFBUCx5QkFBTzs7UUFDWCxJQUFHLENBQUMsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPO1FBQ3hCLElBQUksQ0FBQyxNQUFNLENBQ1YsSUFBSSxDQUFDLE1BQU0sT0FBWCxJQUFJLEdBQVEsS0FBSyxDQUFDLElBQUksU0FBSyxJQUFJLEdBQy9CLENBQUM7S0FDRjtJQUVELHNCQUFLLEdBQUw7UUFBTSxjQUFPO2FBQVAsVUFBTyxFQUFQLHFCQUFPLEVBQVAsSUFBTztZQUFQLHlCQUFPOztRQUNaLElBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU87UUFDeEIsSUFBSSxDQUFDLE1B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QUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDbkNBLEdBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxVQUFDLFNBQVM7Z0JBQ3hDLElBQUksTUFBTSxHQUFHQSxHQUFDLENBQUMsU0FBUyxDQUFDLEtBQUksQ0FBQyxVQUFVLEVBQUUsRUFBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBQyxDQUFDLENBQUM7Z0JBQ3BFLEtBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO2FBQ3ZDLENBQUMsQ0FBQztTQUNOO1FBQ0QsSUFBSSxXQUFXLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDcENBLEdBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxVQUFDLFVBQVU7Z0JBQzFDLElBQUksTUFBTSxHQUFHQSxHQUFDLENBQUMsU0FBUyxDQUFDLEtBQUksQ0FBQyxXQUFXLEVBQUUsRUFBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBQyxDQUFDLENBQUM7Z0JBQ3RFLEtBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsVUFBVSxDQUFDO2FBQ3pDLENBQUMsQ0FBQztTQUNOO1FBQ0QsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDbkNBLEdBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxVQUFDLEdBQUc7Z0JBQ2xDLElBQUksTUFBTSxHQUFHQSxHQUFDLENBQUMsU0FBUyxDQUFDLEtBQUksQ0FBQyxVQUFVLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBQyxDQUFDLENBQUM7Z0JBQzlELEtBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDO2FBQ2pDLENBQUMsQ0FBQztTQUNOO1FBQ0QsSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFD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
