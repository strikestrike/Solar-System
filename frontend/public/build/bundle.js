
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (typeof $$scope.dirty === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.17.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    var bind$1 = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (typeof result[key] === 'object' && typeof val === 'object') {
          result[key] = merge(result[key], val);
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Function equal to merge with the difference being that no reference
     * to original objects is kept.
     *
     * @see merge
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function deepMerge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (typeof result[key] === 'object' && typeof val === 'object') {
          result[key] = deepMerge(result[key], val);
        } else if (typeof val === 'object') {
          result[key] = deepMerge({}, val);
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind$1(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      deepMerge: deepMerge,
      extend: extend,
      trim: trim
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password || '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          var cookies$1 = cookies;

          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies$1.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (requestData === undefined) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'params', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy'];
      var defaultToConfig2Keys = [
        'baseURL', 'url', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress',
        'maxContentLength', 'validateStatus', 'maxRedirects', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath'
      ];

      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        }
      });

      utils.forEach(mergeDeepPropertiesKeys, function mergeDeepProperties(prop) {
        if (utils.isObject(config2[prop])) {
          config[prop] = utils.deepMerge(config1[prop], config2[prop]);
        } else if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        } else if (utils.isObject(config1[prop])) {
          config[prop] = utils.deepMerge(config1[prop]);
        } else if (typeof config1[prop] !== 'undefined') {
          config[prop] = config1[prop];
        }
      });

      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        } else if (typeof config1[prop] !== 'undefined') {
          config[prop] = config1[prop];
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys);

      var otherKeys = Object
        .keys(config2)
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils.forEach(otherKeys, function otherKeysDefaultToConfig2(prop) {
        if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        } else if (typeof config1[prop] !== 'undefined') {
          config[prop] = config1[prop];
        }
      });

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(utils.merge(config || {}, {
          method: method,
          url: url
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(utils.merge(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind$1(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios_1;

    // Factory for creating new instances
    axios.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios.Cancel = Cancel_1;
    axios.CancelToken = CancelToken_1;
    axios.isCancel = isCancel;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;

    var axios_1 = axios;

    // Allow use of default import syntax in TypeScript
    var default_1 = axios;
    axios_1.default = default_1;

    var axios$1 = axios_1;

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    function toVal(mix) {
    	var k, y, str='';
    	if (mix) {
    		if (typeof mix === 'object') {
    			if (!!mix.push) {
    				for (k=0; k < mix.length; k++) {
    					if (mix[k] && (y = toVal(mix[k]))) {
    						str && (str += ' ');
    						str += y;
    					}
    				}
    			} else {
    				for (k in mix) {
    					if (mix[k] && (y = toVal(k))) {
    						str && (str += ' ');
    						str += y;
    					}
    				}
    			}
    		} else if (typeof mix !== 'boolean' && !mix.call) {
    			str && (str += ' ');
    			str += mix;
    		}
    	}
    	return str;
    }

    function clsx () {
    	var i=0, x, str='';
    	while (i < arguments.length) {
    		if (x = toVal(arguments[i++])) {
    			str && (str += ' ');
    			str += x;
    		}
    	}
    	return str;
    }

    function getOriginalBodyPadding() {
      const style = window ? window.getComputedStyle(document.body, null) : {};

      return parseInt((style && style.getPropertyValue('padding-right')) || 0, 10);
    }

    function getScrollbarWidth() {
      let scrollDiv = document.createElement('div');
      // .modal-scrollbar-measure styles // https://github.com/twbs/bootstrap/blob/v4.0.0-alpha.4/scss/_modal.scss#L106-L113
      scrollDiv.style.position = 'absolute';
      scrollDiv.style.top = '-9999px';
      scrollDiv.style.width = '50px';
      scrollDiv.style.height = '50px';
      scrollDiv.style.overflow = 'scroll';
      document.body.appendChild(scrollDiv);
      const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      return scrollbarWidth;
    }

    function setScrollbarWidth(padding) {
      document.body.style.paddingRight = padding > 0 ? `${padding}px` : null;
    }

    function isBodyOverflowing() {
      return window ? document.body.clientWidth < window.innerWidth : false;
    }

    function isObject$1(value) {
      const type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    function conditionallyUpdateScrollbar() {
      const scrollbarWidth = getScrollbarWidth();
      // https://github.com/twbs/bootstrap/blob/v4.0.0-alpha.6/js/src/modal.js#L433
      const fixedContent = document.querySelectorAll(
        '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top'
      )[0];
      const bodyPadding = fixedContent
        ? parseInt(fixedContent.style.paddingRight || 0, 10)
        : 0;

      if (isBodyOverflowing()) {
        setScrollbarWidth(bodyPadding + scrollbarWidth);
      }
    }

    function getColumnSizeClass(isXs, colWidth, colSize) {
      if (colSize === true || colSize === '') {
        return isXs ? 'col' : `col-${colWidth}`;
      } else if (colSize === 'auto') {
        return isXs ? 'col-auto' : `col-${colWidth}-auto`;
      }

      return isXs ? `col-${colSize}` : `col-${colWidth}-${colSize}`;
    }

    function clean($$props) {
      const rest = {};
      for (const key of Object.keys($$props)) {
        if (key !== "children" && key !== "$$scope" && key !== "$$slots") {
          rest[key] = $$props[key];
        }
      }
      return rest;
    }

    function browserEvent(target, ...args) {
      target.addEventListener(...args);

      return () => target.removeEventListener(...args);
    }

    /* node_modules\sveltestrap\src\Button.svelte generated by Svelte v3.17.2 */
    const file = "node_modules\\sveltestrap\\src\\Button.svelte";

    // (53:0) {:else}
    function create_else_block_1(ctx) {
    	let button;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);
    	const if_block_creators = [create_if_block_2, create_if_block_3, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*close*/ ctx[1]) return 0;
    		if (/*children*/ ctx[0]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	let button_levels = [
    		/*props*/ ctx[10],
    		{ id: /*id*/ ctx[4] },
    		{ class: /*classes*/ ctx[8] },
    		{ disabled: /*disabled*/ ctx[2] },
    		{ value: /*value*/ ctx[6] },
    		{
    			"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    		},
    		{ style: /*style*/ ctx[5] }
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button = element("button");

    			if (!default_slot) {
    				if_block.c();
    			}

    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			add_location(button, file, 53, 2, 1061);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!default_slot) {
    				if_blocks[current_block_type_index].m(button, null);
    			}

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;
    			dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[21], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (!default_slot) {
    				let previous_block_index = current_block_type_index;
    				current_block_type_index = select_block_type_2(ctx);

    				if (current_block_type_index === previous_block_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				} else {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(button, null);
    				}
    			}

    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 262144) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[18], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null));
    			}

    			set_attributes(button, get_spread_update(button_levels, [
    				dirty & /*props*/ 1024 && /*props*/ ctx[10],
    				dirty & /*id*/ 16 && { id: /*id*/ ctx[4] },
    				dirty & /*classes*/ 256 && { class: /*classes*/ ctx[8] },
    				dirty & /*disabled*/ 4 && { disabled: /*disabled*/ ctx[2] },
    				dirty & /*value*/ 64 && { value: /*value*/ ctx[6] },
    				dirty & /*ariaLabel, defaultAriaLabel*/ 640 && {
    					"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    				},
    				dirty & /*style*/ 32 && { style: /*style*/ ctx[5] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);

    			if (!default_slot) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(53:0) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (37:0) {#if href}
    function create_if_block(ctx) {
    	let a;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*children*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	let a_levels = [
    		/*props*/ ctx[10],
    		{ id: /*id*/ ctx[4] },
    		{ class: /*classes*/ ctx[8] },
    		{ disabled: /*disabled*/ ctx[2] },
    		{ href: /*href*/ ctx[3] },
    		{
    			"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    		},
    		{ style: /*style*/ ctx[5] }
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			a = element("a");
    			if_block.c();
    			set_attributes(a, a_data);
    			add_location(a, file, 37, 2, 825);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			if_blocks[current_block_type_index].m(a, null);
    			current = true;
    			dispose = listen_dev(a, "click", /*click_handler*/ ctx[20], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(a, null);
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				dirty & /*props*/ 1024 && /*props*/ ctx[10],
    				dirty & /*id*/ 16 && { id: /*id*/ ctx[4] },
    				dirty & /*classes*/ 256 && { class: /*classes*/ ctx[8] },
    				dirty & /*disabled*/ 4 && { disabled: /*disabled*/ ctx[2] },
    				dirty & /*href*/ 8 && { href: /*href*/ ctx[3] },
    				dirty & /*ariaLabel, defaultAriaLabel*/ 640 && {
    					"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    				},
    				dirty & /*style*/ 32 && { style: /*style*/ ctx[5] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if_blocks[current_block_type_index].d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block.name,
    		type: "if",
    		source: "(37:0) {#if href}",
    		ctx
    	});

    	return block_1;
    }

    // (68:6) {:else}
    function create_else_block_2(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	const block_1 = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 262144) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[18], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(68:6) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (66:25) 
    function create_if_block_3(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*children*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 1) set_data_dev(t, /*children*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(66:25) ",
    		ctx
    	});

    	return block_1;
    }

    // (64:6) {#if close}
    function create_if_block_2(ctx) {
    	let span;

    	const block_1 = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "×";
    			attr_dev(span, "aria-hidden", "true");
    			add_location(span, file, 64, 8, 1250);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(64:6) {#if close}",
    		ctx
    	});

    	return block_1;
    }

    // (49:4) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	const block_1 = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 262144) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[18], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block.name,
    		type: "else",
    		source: "(49:4) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (47:4) {#if children}
    function create_if_block_1(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*children*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 1) set_data_dev(t, /*children*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(47:4) {#if children}",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block_1 = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { active = false } = $$props;
    	let { block = false } = $$props;
    	let { children = undefined } = $$props;
    	let { close = false } = $$props;
    	let { color = "secondary" } = $$props;
    	let { disabled = false } = $$props;
    	let { href = "" } = $$props;
    	let { id = "" } = $$props;
    	let { outline = false } = $$props;
    	let { size = "" } = $$props;
    	let { style = "" } = $$props;
    	let { value = "" } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate(17, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(11, className = $$new_props.class);
    		if ("active" in $$new_props) $$invalidate(12, active = $$new_props.active);
    		if ("block" in $$new_props) $$invalidate(13, block = $$new_props.block);
    		if ("children" in $$new_props) $$invalidate(0, children = $$new_props.children);
    		if ("close" in $$new_props) $$invalidate(1, close = $$new_props.close);
    		if ("color" in $$new_props) $$invalidate(14, color = $$new_props.color);
    		if ("disabled" in $$new_props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ("href" in $$new_props) $$invalidate(3, href = $$new_props.href);
    		if ("id" in $$new_props) $$invalidate(4, id = $$new_props.id);
    		if ("outline" in $$new_props) $$invalidate(15, outline = $$new_props.outline);
    		if ("size" in $$new_props) $$invalidate(16, size = $$new_props.size);
    		if ("style" in $$new_props) $$invalidate(5, style = $$new_props.style);
    		if ("value" in $$new_props) $$invalidate(6, value = $$new_props.value);
    		if ("$$scope" in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			className,
    			active,
    			block,
    			children,
    			close,
    			color,
    			disabled,
    			href,
    			id,
    			outline,
    			size,
    			style,
    			value,
    			ariaLabel,
    			classes,
    			defaultAriaLabel
    		};
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(17, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(11, className = $$new_props.className);
    		if ("active" in $$props) $$invalidate(12, active = $$new_props.active);
    		if ("block" in $$props) $$invalidate(13, block = $$new_props.block);
    		if ("children" in $$props) $$invalidate(0, children = $$new_props.children);
    		if ("close" in $$props) $$invalidate(1, close = $$new_props.close);
    		if ("color" in $$props) $$invalidate(14, color = $$new_props.color);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ("href" in $$props) $$invalidate(3, href = $$new_props.href);
    		if ("id" in $$props) $$invalidate(4, id = $$new_props.id);
    		if ("outline" in $$props) $$invalidate(15, outline = $$new_props.outline);
    		if ("size" in $$props) $$invalidate(16, size = $$new_props.size);
    		if ("style" in $$props) $$invalidate(5, style = $$new_props.style);
    		if ("value" in $$props) $$invalidate(6, value = $$new_props.value);
    		if ("ariaLabel" in $$props) $$invalidate(7, ariaLabel = $$new_props.ariaLabel);
    		if ("classes" in $$props) $$invalidate(8, classes = $$new_props.classes);
    		if ("defaultAriaLabel" in $$props) $$invalidate(9, defaultAriaLabel = $$new_props.defaultAriaLabel);
    	};

    	let ariaLabel;
    	let classes;
    	let defaultAriaLabel;

    	$$self.$$.update = () => {
    		 $$invalidate(7, ariaLabel = $$props["aria-label"]);

    		if ($$self.$$.dirty & /*className, close, outline, color, size, block, active*/ 129026) {
    			 $$invalidate(8, classes = clsx(className, { close }, close || "btn", close || `btn${outline ? "-outline" : ""}-${color}`, size ? `btn-${size}` : false, block ? "btn-block" : false, { active }));
    		}

    		if ($$self.$$.dirty & /*close*/ 2) {
    			 $$invalidate(9, defaultAriaLabel = close ? "Close" : null);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		children,
    		close,
    		disabled,
    		href,
    		id,
    		style,
    		value,
    		ariaLabel,
    		classes,
    		defaultAriaLabel,
    		props,
    		className,
    		active,
    		block,
    		color,
    		outline,
    		size,
    		$$props,
    		$$scope,
    		$$slots,
    		click_handler,
    		click_handler_1
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			class: 11,
    			active: 12,
    			block: 13,
    			children: 0,
    			close: 1,
    			color: 14,
    			disabled: 2,
    			href: 3,
    			id: 4,
    			outline: 15,
    			size: 16,
    			style: 5,
    			value: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get children() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set children(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get close() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set close(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outline() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outline(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\ButtonGroup.svelte generated by Svelte v3.17.2 */
    const file$1 = "node_modules\\sveltestrap\\src\\ButtonGroup.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);
    	let div_levels = [/*props*/ ctx[2], { id: /*id*/ ctx[0] }, { class: /*classes*/ ctx[1] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$1, 19, 0, 380);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 128) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[7], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null));
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				dirty & /*props*/ 4 && /*props*/ ctx[2],
    				dirty & /*id*/ 1 && { id: /*id*/ ctx[0] },
    				dirty & /*classes*/ 2 && { class: /*classes*/ ctx[1] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { id = "" } = $$props;
    	let { size = "" } = $$props;
    	let { vertical = false } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(3, className = $$new_props.class);
    		if ("id" in $$new_props) $$invalidate(0, id = $$new_props.id);
    		if ("size" in $$new_props) $$invalidate(4, size = $$new_props.size);
    		if ("vertical" in $$new_props) $$invalidate(5, vertical = $$new_props.vertical);
    		if ("$$scope" in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { className, id, size, vertical, classes };
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(3, className = $$new_props.className);
    		if ("id" in $$props) $$invalidate(0, id = $$new_props.id);
    		if ("size" in $$props) $$invalidate(4, size = $$new_props.size);
    		if ("vertical" in $$props) $$invalidate(5, vertical = $$new_props.vertical);
    		if ("classes" in $$props) $$invalidate(1, classes = $$new_props.classes);
    	};

    	let classes;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, size, vertical*/ 56) {
    			 $$invalidate(1, classes = clsx(className, size ? `btn-group-${size}` : false, vertical ? "btn-group-vertical" : "btn-group"));
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [id, classes, props, className, size, vertical, $$props, $$scope, $$slots];
    }

    class ButtonGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { class: 3, id: 0, size: 4, vertical: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonGroup",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get class() {
    		throw new Error("<ButtonGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ButtonGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<ButtonGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<ButtonGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<ButtonGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<ButtonGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<ButtonGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<ButtonGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\Input.svelte generated by Svelte v3.17.2 */

    const { console: console_1 } = globals;
    const file$2 = "node_modules\\sveltestrap\\src\\Input.svelte";

    // (326:27) 
    function create_if_block_15(ctx) {
    	let select;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[23].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[22], null);

    	let select_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ multiple: /*multiple*/ ctx[5] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] }
    	];

    	let select_data = {};

    	for (let i = 0; i < select_levels.length; i += 1) {
    		select_data = assign(select_data, select_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			if (default_slot) default_slot.c();
    			set_attributes(select, select_data);
    			add_location(select, file$2, 326, 2, 6108);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			if (default_slot) {
    				default_slot.m(select, null);
    			}

    			current = true;

    			dispose = [
    				listen_dev(select, "blur", /*blur_handler_14*/ ctx[122], false, false, false),
    				listen_dev(select, "focus", /*focus_handler_14*/ ctx[123], false, false, false),
    				listen_dev(select, "change", /*change_handler_14*/ ctx[124], false, false, false),
    				listen_dev(select, "input", /*input_handler_14*/ ctx[125], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty[0] & /*$$scope*/ 4194304) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[22], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[22], dirty, null));
    			}

    			set_attributes(select, get_spread_update(select_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				dirty[0] & /*multiple*/ 32 && { multiple: /*multiple*/ ctx[5] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			if (default_slot) default_slot.d(detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(326:27) ",
    		ctx
    	});

    	return block;
    }

    // (310:29) 
    function create_if_block_14(ctx) {
    	let textarea;
    	let dispose;

    	let textarea_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] }
    	];

    	let textarea_data = {};

    	for (let i = 0; i < textarea_levels.length; i += 1) {
    		textarea_data = assign(textarea_data, textarea_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			set_attributes(textarea, textarea_data);
    			add_location(textarea, file$2, 310, 2, 5883);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			set_input_value(textarea, /*value*/ ctx[1]);

    			dispose = [
    				listen_dev(textarea, "blur", /*blur_handler_13*/ ctx[115], false, false, false),
    				listen_dev(textarea, "focus", /*focus_handler_13*/ ctx[116], false, false, false),
    				listen_dev(textarea, "keydown", /*keydown_handler_13*/ ctx[117], false, false, false),
    				listen_dev(textarea, "keypress", /*keypress_handler_13*/ ctx[118], false, false, false),
    				listen_dev(textarea, "keyup", /*keyup_handler_13*/ ctx[119], false, false, false),
    				listen_dev(textarea, "change", /*change_handler_13*/ ctx[120], false, false, false),
    				listen_dev(textarea, "input", /*input_handler_13*/ ctx[121], false, false, false),
    				listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[139])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(textarea, get_spread_update(textarea_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(textarea, /*value*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(310:29) ",
    		ctx
    	});

    	return block;
    }

    // (72:0) {#if tag === 'input'}
    function create_if_block$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*type*/ ctx[3] === "text") return create_if_block_1$1;
    		if (/*type*/ ctx[3] === "password") return create_if_block_2$1;
    		if (/*type*/ ctx[3] === "email") return create_if_block_3$1;
    		if (/*type*/ ctx[3] === "file") return create_if_block_4;
    		if (/*type*/ ctx[3] === "checkbox") return create_if_block_5;
    		if (/*type*/ ctx[3] === "radio") return create_if_block_6;
    		if (/*type*/ ctx[3] === "url") return create_if_block_7;
    		if (/*type*/ ctx[3] === "number") return create_if_block_8;
    		if (/*type*/ ctx[3] === "date") return create_if_block_9;
    		if (/*type*/ ctx[3] === "time") return create_if_block_10;
    		if (/*type*/ ctx[3] === "datetime") return create_if_block_11;
    		if (/*type*/ ctx[3] === "color") return create_if_block_12;
    		if (/*type*/ ctx[3] === "search") return create_if_block_13;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(72:0) {#if tag === 'input'}",
    		ctx
    	});

    	return block;
    }

    // (290:30) 
    function create_if_block_13(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "search" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$2, 290, 4, 5568);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_12*/ ctx[108], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_12*/ ctx[109], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_12*/ ctx[110], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_12*/ ctx[111], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_12*/ ctx[112], false, false, false),
    				listen_dev(input, "change", /*change_handler_12*/ ctx[113], false, false, false),
    				listen_dev(input, "input", /*input_handler_12*/ ctx[114], false, false, false),
    				listen_dev(input, "input", /*input_input_handler_9*/ ctx[138])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "search" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(290:30) ",
    		ctx
    	});

    	return block;
    }

    // (272:29) 
    function create_if_block_12(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "color" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$2, 272, 4, 5260);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_11*/ ctx[101], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_11*/ ctx[102], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_11*/ ctx[103], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_11*/ ctx[104], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_11*/ ctx[105], false, false, false),
    				listen_dev(input, "change", /*change_handler_11*/ ctx[106], false, false, false),
    				listen_dev(input, "input", /*input_handler_11*/ ctx[107], false, false, false),
    				listen_dev(input, "input", /*input_input_handler_8*/ ctx[137])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "color" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(272:29) ",
    		ctx
    	});

    	return block;
    }

    // (254:32) 
    function create_if_block_11(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "datetime" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$2, 254, 4, 4950);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_10*/ ctx[94], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_10*/ ctx[95], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_10*/ ctx[96], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_10*/ ctx[97], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_10*/ ctx[98], false, false, false),
    				listen_dev(input, "change", /*change_handler_10*/ ctx[99], false, false, false),
    				listen_dev(input, "input", /*input_handler_10*/ ctx[100], false, false, false),
    				listen_dev(input, "input", /*input_input_handler_7*/ ctx[136])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "datetime" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(254:32) ",
    		ctx
    	});

    	return block;
    }

    // (236:28) 
    function create_if_block_10(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "time" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$2, 236, 4, 4641);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_9*/ ctx[87], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_9*/ ctx[88], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_9*/ ctx[89], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_9*/ ctx[90], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_9*/ ctx[91], false, false, false),
    				listen_dev(input, "change", /*change_handler_9*/ ctx[92], false, false, false),
    				listen_dev(input, "input", /*input_handler_9*/ ctx[93], false, false, false),
    				listen_dev(input, "input", /*input_input_handler_6*/ ctx[135])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "time" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(236:28) ",
    		ctx
    	});

    	return block;
    }

    // (218:28) 
    function create_if_block_9(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "date" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$2, 218, 4, 4336);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_8*/ ctx[80], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_8*/ ctx[81], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_8*/ ctx[82], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_8*/ ctx[83], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_8*/ ctx[84], false, false, false),
    				listen_dev(input, "change", /*change_handler_8*/ ctx[85], false, false, false),
    				listen_dev(input, "input", /*input_handler_8*/ ctx[86], false, false, false),
    				listen_dev(input, "input", /*input_input_handler_5*/ ctx[134])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "date" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(218:28) ",
    		ctx
    	});

    	return block;
    }

    // (200:30) 
    function create_if_block_8(ctx) {
    	let input;
    	let input_updating = false;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "number" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	function input_input_handler_4() {
    		input_updating = true;
    		/*input_input_handler_4*/ ctx[133].call(input);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$2, 200, 4, 4029);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_7*/ ctx[73], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_7*/ ctx[74], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_7*/ ctx[75], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_7*/ ctx[76], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_7*/ ctx[77], false, false, false),
    				listen_dev(input, "change", /*change_handler_7*/ ctx[78], false, false, false),
    				listen_dev(input, "input", /*input_handler_7*/ ctx[79], false, false, false),
    				listen_dev(input, "input", input_input_handler_4)
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "number" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (!input_updating && dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}

    			input_updating = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(200:30) ",
    		ctx
    	});

    	return block;
    }

    // (182:27) 
    function create_if_block_7(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "url" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$2, 182, 4, 3723);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_6*/ ctx[66], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_6*/ ctx[67], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_6*/ ctx[68], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_6*/ ctx[69], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_6*/ ctx[70], false, false, false),
    				listen_dev(input, "change", /*change_handler_6*/ ctx[71], false, false, false),
    				listen_dev(input, "input", /*input_handler_6*/ ctx[72], false, false, false),
    				listen_dev(input, "input", /*input_input_handler_3*/ ctx[132])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "url" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(182:27) ",
    		ctx
    	});

    	return block;
    }

    // (164:29) 
    function create_if_block_6(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "radio" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$2, 164, 4, 3418);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_5*/ ctx[59], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_5*/ ctx[60], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_5*/ ctx[61], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_5*/ ctx[62], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_5*/ ctx[63], false, false, false),
    				listen_dev(input, "change", /*change_handler_5*/ ctx[64], false, false, false),
    				listen_dev(input, "input", /*input_handler_5*/ ctx[65], false, false, false),
    				listen_dev(input, "change", /*input_change_handler_2*/ ctx[131])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "radio" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(164:29) ",
    		ctx
    	});

    	return block;
    }

    // (145:32) 
    function create_if_block_5(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "checkbox" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$2, 145, 4, 3089);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			input.checked = /*checked*/ ctx[0];
    			set_input_value(input, /*value*/ ctx[1]);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_4*/ ctx[52], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_4*/ ctx[53], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_4*/ ctx[54], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_4*/ ctx[55], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_4*/ ctx[56], false, false, false),
    				listen_dev(input, "change", /*change_handler_4*/ ctx[57], false, false, false),
    				listen_dev(input, "input", /*input_handler_4*/ ctx[58], false, false, false),
    				listen_dev(input, "change", /*input_change_handler_1*/ ctx[130])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "checkbox" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(145:32) ",
    		ctx
    	});

    	return block;
    }

    // (127:28) 
    function create_if_block_4(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "file" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$2, 127, 4, 2780);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_3*/ ctx[45], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_3*/ ctx[46], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_3*/ ctx[47], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_3*/ ctx[48], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_3*/ ctx[49], false, false, false),
    				listen_dev(input, "change", /*change_handler_3*/ ctx[50], false, false, false),
    				listen_dev(input, "input", /*input_handler_3*/ ctx[51], false, false, false),
    				listen_dev(input, "change", /*input_change_handler*/ ctx[129])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "file" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(127:28) ",
    		ctx
    	});

    	return block;
    }

    // (109:29) 
    function create_if_block_3$1(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "email" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$2, 109, 4, 2474);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_2*/ ctx[38], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_2*/ ctx[39], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_2*/ ctx[40], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_2*/ ctx[41], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_2*/ ctx[42], false, false, false),
    				listen_dev(input, "change", /*change_handler_2*/ ctx[43], false, false, false),
    				listen_dev(input, "input", /*input_handler_2*/ ctx[44], false, false, false),
    				listen_dev(input, "input", /*input_input_handler_2*/ ctx[128])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "email" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2 && input.value !== /*value*/ ctx[1]) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(109:29) ",
    		ctx
    	});

    	return block;
    }

    // (91:32) 
    function create_if_block_2$1(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "password" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$2, 91, 4, 2164);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_1*/ ctx[31], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_1*/ ctx[32], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_1*/ ctx[33], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_1*/ ctx[34], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_1*/ ctx[35], false, false, false),
    				listen_dev(input, "change", /*change_handler_1*/ ctx[36], false, false, false),
    				listen_dev(input, "input", /*input_handler_1*/ ctx[37], false, false, false),
    				listen_dev(input, "input", /*input_input_handler_1*/ ctx[127])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "password" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2 && input.value !== /*value*/ ctx[1]) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(91:32) ",
    		ctx
    	});

    	return block;
    }

    // (73:2) {#if type === 'text'}
    function create_if_block_1$1(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "text" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$2, 73, 4, 1855);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler*/ ctx[24], false, false, false),
    				listen_dev(input, "focus", /*focus_handler*/ ctx[25], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler*/ ctx[26], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler*/ ctx[27], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler*/ ctx[28], false, false, false),
    				listen_dev(input, "change", /*change_handler*/ ctx[29], false, false, false),
    				listen_dev(input, "input", /*input_handler*/ ctx[30], false, false, false),
    				listen_dev(input, "input", /*input_input_handler*/ ctx[126])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "text" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2 && input.value !== /*value*/ ctx[1]) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(73:2) {#if type === 'text'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_if_block_14, create_if_block_15];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tag*/ ctx[11] === "input") return 0;
    		if (/*tag*/ ctx[11] === "textarea") return 1;
    		if (/*tag*/ ctx[11] === "select") return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { type = "text" } = $$props;
    	let { size = undefined } = $$props;
    	let { bsSize = undefined } = $$props;
    	let { checked = false } = $$props;
    	let { valid = false } = $$props;
    	let { invalid = false } = $$props;
    	let { plaintext = false } = $$props;
    	let { addon = false } = $$props;
    	let { value = "" } = $$props;
    	let { files = "" } = $$props;
    	let { readonly } = $$props;
    	let { multiple = false } = $$props;
    	let { id = "" } = $$props;
    	let { name = "" } = $$props;
    	let { placeholder = "" } = $$props;
    	let { disabled = false } = $$props;

    	// eslint-disable-next-line no-unused-vars
    	const { type: _omitType, ...props } = clean($$props);

    	let classes;
    	let tag;
    	let { $$slots = {}, $$scope } = $$props;

    	function blur_handler(event) {
    		bubble($$self, event);
    	}

    	function focus_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler(event) {
    		bubble($$self, event);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function input_handler(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_1(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_1(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_1(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_1(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_1(event) {
    		bubble($$self, event);
    	}

    	function change_handler_1(event) {
    		bubble($$self, event);
    	}

    	function input_handler_1(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_2(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_2(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_2(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_2(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_2(event) {
    		bubble($$self, event);
    	}

    	function change_handler_2(event) {
    		bubble($$self, event);
    	}

    	function input_handler_2(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_3(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_3(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_3(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_3(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_3(event) {
    		bubble($$self, event);
    	}

    	function change_handler_3(event) {
    		bubble($$self, event);
    	}

    	function input_handler_3(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_4(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_4(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_4(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_4(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_4(event) {
    		bubble($$self, event);
    	}

    	function change_handler_4(event) {
    		bubble($$self, event);
    	}

    	function input_handler_4(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_5(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_5(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_5(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_5(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_5(event) {
    		bubble($$self, event);
    	}

    	function change_handler_5(event) {
    		bubble($$self, event);
    	}

    	function input_handler_5(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_6(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_6(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_6(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_6(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_6(event) {
    		bubble($$self, event);
    	}

    	function change_handler_6(event) {
    		bubble($$self, event);
    	}

    	function input_handler_6(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_7(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_7(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_7(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_7(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_7(event) {
    		bubble($$self, event);
    	}

    	function change_handler_7(event) {
    		bubble($$self, event);
    	}

    	function input_handler_7(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_8(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_8(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_8(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_8(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_8(event) {
    		bubble($$self, event);
    	}

    	function change_handler_8(event) {
    		bubble($$self, event);
    	}

    	function input_handler_8(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_9(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_9(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_9(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_9(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_9(event) {
    		bubble($$self, event);
    	}

    	function change_handler_9(event) {
    		bubble($$self, event);
    	}

    	function input_handler_9(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_10(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_10(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_10(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_10(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_10(event) {
    		bubble($$self, event);
    	}

    	function change_handler_10(event) {
    		bubble($$self, event);
    	}

    	function input_handler_10(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_11(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_11(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_11(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_11(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_11(event) {
    		bubble($$self, event);
    	}

    	function change_handler_11(event) {
    		bubble($$self, event);
    	}

    	function input_handler_11(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_12(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_12(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_12(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_12(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_12(event) {
    		bubble($$self, event);
    	}

    	function change_handler_12(event) {
    		bubble($$self, event);
    	}

    	function input_handler_12(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_13(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_13(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_13(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_13(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_13(event) {
    		bubble($$self, event);
    	}

    	function change_handler_13(event) {
    		bubble($$self, event);
    	}

    	function input_handler_13(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_14(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_14(event) {
    		bubble($$self, event);
    	}

    	function change_handler_14(event) {
    		bubble($$self, event);
    	}

    	function input_handler_14(event) {
    		bubble($$self, event);
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input_input_handler_1() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input_input_handler_2() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input_change_handler() {
    		files = this.files;
    		$$invalidate(2, files);
    	}

    	function input_change_handler_1() {
    		checked = this.checked;
    		value = this.value;
    		$$invalidate(0, checked);
    		$$invalidate(1, value);
    	}

    	function input_change_handler_2() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input_input_handler_3() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input_input_handler_4() {
    		value = to_number(this.value);
    		$$invalidate(1, value);
    	}

    	function input_input_handler_5() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input_input_handler_6() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input_input_handler_7() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input_input_handler_8() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input_input_handler_9() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function textarea_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate(21, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(15, className = $$new_props.class);
    		if ("type" in $$new_props) $$invalidate(3, type = $$new_props.type);
    		if ("size" in $$new_props) $$invalidate(13, size = $$new_props.size);
    		if ("bsSize" in $$new_props) $$invalidate(14, bsSize = $$new_props.bsSize);
    		if ("checked" in $$new_props) $$invalidate(0, checked = $$new_props.checked);
    		if ("valid" in $$new_props) $$invalidate(16, valid = $$new_props.valid);
    		if ("invalid" in $$new_props) $$invalidate(17, invalid = $$new_props.invalid);
    		if ("plaintext" in $$new_props) $$invalidate(18, plaintext = $$new_props.plaintext);
    		if ("addon" in $$new_props) $$invalidate(19, addon = $$new_props.addon);
    		if ("value" in $$new_props) $$invalidate(1, value = $$new_props.value);
    		if ("files" in $$new_props) $$invalidate(2, files = $$new_props.files);
    		if ("readonly" in $$new_props) $$invalidate(4, readonly = $$new_props.readonly);
    		if ("multiple" in $$new_props) $$invalidate(5, multiple = $$new_props.multiple);
    		if ("id" in $$new_props) $$invalidate(6, id = $$new_props.id);
    		if ("name" in $$new_props) $$invalidate(7, name = $$new_props.name);
    		if ("placeholder" in $$new_props) $$invalidate(8, placeholder = $$new_props.placeholder);
    		if ("disabled" in $$new_props) $$invalidate(9, disabled = $$new_props.disabled);
    		if ("$$scope" in $$new_props) $$invalidate(22, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			className,
    			type,
    			size,
    			bsSize,
    			checked,
    			valid,
    			invalid,
    			plaintext,
    			addon,
    			value,
    			files,
    			readonly,
    			multiple,
    			id,
    			name,
    			placeholder,
    			disabled,
    			classes,
    			tag
    		};
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(21, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(15, className = $$new_props.className);
    		if ("type" in $$props) $$invalidate(3, type = $$new_props.type);
    		if ("size" in $$props) $$invalidate(13, size = $$new_props.size);
    		if ("bsSize" in $$props) $$invalidate(14, bsSize = $$new_props.bsSize);
    		if ("checked" in $$props) $$invalidate(0, checked = $$new_props.checked);
    		if ("valid" in $$props) $$invalidate(16, valid = $$new_props.valid);
    		if ("invalid" in $$props) $$invalidate(17, invalid = $$new_props.invalid);
    		if ("plaintext" in $$props) $$invalidate(18, plaintext = $$new_props.plaintext);
    		if ("addon" in $$props) $$invalidate(19, addon = $$new_props.addon);
    		if ("value" in $$props) $$invalidate(1, value = $$new_props.value);
    		if ("files" in $$props) $$invalidate(2, files = $$new_props.files);
    		if ("readonly" in $$props) $$invalidate(4, readonly = $$new_props.readonly);
    		if ("multiple" in $$props) $$invalidate(5, multiple = $$new_props.multiple);
    		if ("id" in $$props) $$invalidate(6, id = $$new_props.id);
    		if ("name" in $$props) $$invalidate(7, name = $$new_props.name);
    		if ("placeholder" in $$props) $$invalidate(8, placeholder = $$new_props.placeholder);
    		if ("disabled" in $$props) $$invalidate(9, disabled = $$new_props.disabled);
    		if ("classes" in $$props) $$invalidate(10, classes = $$new_props.classes);
    		if ("tag" in $$props) $$invalidate(11, tag = $$new_props.tag);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*type, plaintext, addon, size, className, invalid, valid, bsSize*/ 1040392) {
    			 {
    				const checkInput = ["radio", "checkbox"].indexOf(type) > -1;
    				const isNotaNumber = new RegExp("\\D", "g");
    				const fileInput = type === "file";
    				const textareaInput = type === "textarea";
    				const selectInput = type === "select";
    				$$invalidate(11, tag = selectInput || textareaInput ? type : "input");
    				let formControlClass = "form-control";

    				if (plaintext) {
    					formControlClass = `${formControlClass}-plaintext`;
    					$$invalidate(11, tag = "input");
    				} else if (fileInput) {
    					formControlClass = `${formControlClass}-file`;
    				} else if (checkInput) {
    					if (addon) {
    						formControlClass = null;
    					} else {
    						formControlClass = "form-check-input";
    					}
    				}

    				if (size && isNotaNumber.test(size)) {
    					console.warn("Please use the prop \"bsSize\" instead of the \"size\" to bootstrap's input sizing.");
    					$$invalidate(14, bsSize = size);
    					$$invalidate(13, size = undefined);
    				}

    				$$invalidate(10, classes = clsx(className, invalid && "is-invalid", valid && "is-valid", bsSize ? `form-control-${bsSize}` : false, formControlClass));
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		checked,
    		value,
    		files,
    		type,
    		readonly,
    		multiple,
    		id,
    		name,
    		placeholder,
    		disabled,
    		classes,
    		tag,
    		props,
    		size,
    		bsSize,
    		className,
    		valid,
    		invalid,
    		plaintext,
    		addon,
    		_omitType,
    		$$props,
    		$$scope,
    		$$slots,
    		blur_handler,
    		focus_handler,
    		keydown_handler,
    		keypress_handler,
    		keyup_handler,
    		change_handler,
    		input_handler,
    		blur_handler_1,
    		focus_handler_1,
    		keydown_handler_1,
    		keypress_handler_1,
    		keyup_handler_1,
    		change_handler_1,
    		input_handler_1,
    		blur_handler_2,
    		focus_handler_2,
    		keydown_handler_2,
    		keypress_handler_2,
    		keyup_handler_2,
    		change_handler_2,
    		input_handler_2,
    		blur_handler_3,
    		focus_handler_3,
    		keydown_handler_3,
    		keypress_handler_3,
    		keyup_handler_3,
    		change_handler_3,
    		input_handler_3,
    		blur_handler_4,
    		focus_handler_4,
    		keydown_handler_4,
    		keypress_handler_4,
    		keyup_handler_4,
    		change_handler_4,
    		input_handler_4,
    		blur_handler_5,
    		focus_handler_5,
    		keydown_handler_5,
    		keypress_handler_5,
    		keyup_handler_5,
    		change_handler_5,
    		input_handler_5,
    		blur_handler_6,
    		focus_handler_6,
    		keydown_handler_6,
    		keypress_handler_6,
    		keyup_handler_6,
    		change_handler_6,
    		input_handler_6,
    		blur_handler_7,
    		focus_handler_7,
    		keydown_handler_7,
    		keypress_handler_7,
    		keyup_handler_7,
    		change_handler_7,
    		input_handler_7,
    		blur_handler_8,
    		focus_handler_8,
    		keydown_handler_8,
    		keypress_handler_8,
    		keyup_handler_8,
    		change_handler_8,
    		input_handler_8,
    		blur_handler_9,
    		focus_handler_9,
    		keydown_handler_9,
    		keypress_handler_9,
    		keyup_handler_9,
    		change_handler_9,
    		input_handler_9,
    		blur_handler_10,
    		focus_handler_10,
    		keydown_handler_10,
    		keypress_handler_10,
    		keyup_handler_10,
    		change_handler_10,
    		input_handler_10,
    		blur_handler_11,
    		focus_handler_11,
    		keydown_handler_11,
    		keypress_handler_11,
    		keyup_handler_11,
    		change_handler_11,
    		input_handler_11,
    		blur_handler_12,
    		focus_handler_12,
    		keydown_handler_12,
    		keypress_handler_12,
    		keyup_handler_12,
    		change_handler_12,
    		input_handler_12,
    		blur_handler_13,
    		focus_handler_13,
    		keydown_handler_13,
    		keypress_handler_13,
    		keyup_handler_13,
    		change_handler_13,
    		input_handler_13,
    		blur_handler_14,
    		focus_handler_14,
    		change_handler_14,
    		input_handler_14,
    		input_input_handler,
    		input_input_handler_1,
    		input_input_handler_2,
    		input_change_handler,
    		input_change_handler_1,
    		input_change_handler_2,
    		input_input_handler_3,
    		input_input_handler_4,
    		input_input_handler_5,
    		input_input_handler_6,
    		input_input_handler_7,
    		input_input_handler_8,
    		input_input_handler_9,
    		textarea_input_handler
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$2,
    			create_fragment$2,
    			safe_not_equal,
    			{
    				class: 15,
    				type: 3,
    				size: 13,
    				bsSize: 14,
    				checked: 0,
    				valid: 16,
    				invalid: 17,
    				plaintext: 18,
    				addon: 19,
    				value: 1,
    				files: 2,
    				readonly: 4,
    				multiple: 5,
    				id: 6,
    				name: 7,
    				placeholder: 8,
    				disabled: 9
    			},
    			[-1, -1, -1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*readonly*/ ctx[4] === undefined && !("readonly" in props)) {
    			console_1.warn("<Input> was created without expected prop 'readonly'");
    		}
    	}

    	get class() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bsSize() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bsSize(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valid() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valid(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get invalid() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set invalid(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get plaintext() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set plaintext(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get addon() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addon(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get files() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set files(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\Label.svelte generated by Svelte v3.17.2 */
    const file$3 = "node_modules\\sveltestrap\\src\\Label.svelte";

    function create_fragment$3(ctx) {
    	let label;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[17], null);

    	let label_levels = [
    		/*props*/ ctx[3],
    		{ id: /*id*/ ctx[1] },
    		{ class: /*classes*/ ctx[2] },
    		{ for: /*fore*/ ctx[0] }
    	];

    	let label_data = {};

    	for (let i = 0; i < label_levels.length; i += 1) {
    		label_data = assign(label_data, label_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			if (default_slot) default_slot.c();
    			set_attributes(label, label_data);
    			add_location(label, file$3, 67, 0, 1661);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 131072) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[17], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[17], dirty, null));
    			}

    			set_attributes(label, get_spread_update(label_levels, [
    				dirty & /*props*/ 8 && /*props*/ ctx[3],
    				dirty & /*id*/ 2 && { id: /*id*/ ctx[1] },
    				dirty & /*classes*/ 4 && { class: /*classes*/ ctx[2] },
    				dirty & /*fore*/ 1 && { for: /*fore*/ ctx[0] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const colWidths = ["xs", "sm", "md", "lg", "xl"];
    	let { class: className = "" } = $$props;
    	const props = clean($$props);
    	let { hidden = false } = $$props;
    	let { check = false } = $$props;
    	let { size = "" } = $$props;
    	let { for: fore } = $$props;
    	let { id = "" } = $$props;
    	let { xs = "" } = $$props;
    	let { sm = "" } = $$props;
    	let { md = "" } = $$props;
    	let { lg = "" } = $$props;
    	let { xl = "" } = $$props;
    	let { widths = colWidths } = $$props;
    	const colClasses = [];

    	colWidths.forEach(colWidth => {
    		let columnProp = $$props[colWidth];

    		if (!columnProp && columnProp !== "") {
    			return;
    		}

    		const isXs = colWidth === "xs";
    		let colClass;

    		if (isObject$1(columnProp)) {
    			const colSizeInterfix = isXs ? "-" : `-${colWidth}-`;
    			colClass = getColumnSizeClass(isXs, colWidth, columnProp.size);

    			colClasses.push(clsx({
    				[colClass]: columnProp.size || columnProp.size === "",
    				[`order${colSizeInterfix}${columnProp.order}`]: columnProp.order || columnProp.order === 0,
    				[`offset${colSizeInterfix}${columnProp.offset}`]: columnProp.offset || columnProp.offset === 0
    			}));
    		} else {
    			colClass = getColumnSizeClass(isXs, colWidth, columnProp);
    			colClasses.push(colClass);
    		}
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate(16, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(4, className = $$new_props.class);
    		if ("hidden" in $$new_props) $$invalidate(5, hidden = $$new_props.hidden);
    		if ("check" in $$new_props) $$invalidate(6, check = $$new_props.check);
    		if ("size" in $$new_props) $$invalidate(7, size = $$new_props.size);
    		if ("for" in $$new_props) $$invalidate(0, fore = $$new_props.for);
    		if ("id" in $$new_props) $$invalidate(1, id = $$new_props.id);
    		if ("xs" in $$new_props) $$invalidate(8, xs = $$new_props.xs);
    		if ("sm" in $$new_props) $$invalidate(9, sm = $$new_props.sm);
    		if ("md" in $$new_props) $$invalidate(10, md = $$new_props.md);
    		if ("lg" in $$new_props) $$invalidate(11, lg = $$new_props.lg);
    		if ("xl" in $$new_props) $$invalidate(12, xl = $$new_props.xl);
    		if ("widths" in $$new_props) $$invalidate(13, widths = $$new_props.widths);
    		if ("$$scope" in $$new_props) $$invalidate(17, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			className,
    			hidden,
    			check,
    			size,
    			fore,
    			id,
    			xs,
    			sm,
    			md,
    			lg,
    			xl,
    			widths,
    			classes
    		};
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(16, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(4, className = $$new_props.className);
    		if ("hidden" in $$props) $$invalidate(5, hidden = $$new_props.hidden);
    		if ("check" in $$props) $$invalidate(6, check = $$new_props.check);
    		if ("size" in $$props) $$invalidate(7, size = $$new_props.size);
    		if ("fore" in $$props) $$invalidate(0, fore = $$new_props.fore);
    		if ("id" in $$props) $$invalidate(1, id = $$new_props.id);
    		if ("xs" in $$props) $$invalidate(8, xs = $$new_props.xs);
    		if ("sm" in $$props) $$invalidate(9, sm = $$new_props.sm);
    		if ("md" in $$props) $$invalidate(10, md = $$new_props.md);
    		if ("lg" in $$props) $$invalidate(11, lg = $$new_props.lg);
    		if ("xl" in $$props) $$invalidate(12, xl = $$new_props.xl);
    		if ("widths" in $$props) $$invalidate(13, widths = $$new_props.widths);
    		if ("classes" in $$props) $$invalidate(2, classes = $$new_props.classes);
    	};

    	let classes;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, hidden, check, size*/ 240) {
    			 $$invalidate(2, classes = clsx(className, hidden ? "sr-only" : false, check ? "form-check-label" : false, size ? `col-form-label-${size}` : false, colClasses, colClasses.length ? "col-form-label" : false));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		fore,
    		id,
    		classes,
    		props,
    		className,
    		hidden,
    		check,
    		size,
    		xs,
    		sm,
    		md,
    		lg,
    		xl,
    		widths,
    		colWidths,
    		colClasses,
    		$$props,
    		$$scope,
    		$$slots
    	];
    }

    class Label extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			class: 4,
    			hidden: 5,
    			check: 6,
    			size: 7,
    			for: 0,
    			id: 1,
    			xs: 8,
    			sm: 9,
    			md: 10,
    			lg: 11,
    			xl: 12,
    			widths: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Label",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fore*/ ctx[0] === undefined && !("for" in props)) {
    			console.warn("<Label> was created without expected prop 'for'");
    		}
    	}

    	get class() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hidden() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hidden(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get check() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set check(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get for() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set for(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xs() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xs(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sm() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sm(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get md() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set md(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lg() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lg(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xl() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xl(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get widths() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set widths(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\Modal.svelte generated by Svelte v3.17.2 */

    const file$4 = "node_modules\\sveltestrap\\src\\Modal.svelte";
    const get_external_slot_changes = dirty => ({});
    const get_external_slot_context = ctx => ({});

    // (212:0) {#if _isMounted}
    function create_if_block$2(ctx) {
    	let div;
    	let current;
    	let if_block = /*isOpen*/ ctx[0] && create_if_block_1$2(ctx);

    	let div_levels = [
    		/*props*/ ctx[13],
    		{ class: /*wrapClassName*/ ctx[4] },
    		{ tabindex: "-1" },
    		{
    			style: "position: relative; z-index: " + /*zIndex*/ ctx[9]
    		}
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			set_attributes(div, div_data);
    			add_location(div, file$4, 212, 2, 4520);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*isOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				dirty[0] & /*props*/ 8192 && /*props*/ ctx[13],
    				dirty[0] & /*wrapClassName*/ 16 && { class: /*wrapClassName*/ ctx[4] },
    				{ tabindex: "-1" },
    				dirty[0] & /*zIndex*/ 512 && {
    					style: "position: relative; z-index: " + /*zIndex*/ ctx[9]
    				}
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(212:0) {#if _isMounted}",
    		ctx
    	});

    	return block;
    }

    // (218:4) {#if isOpen}
    function create_if_block_1$2(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let div0_class_value;
    	let div2_class_value;
    	let div2_transition;
    	let t1;
    	let div3;
    	let div3_class_value;
    	let div3_transition;
    	let current;
    	let dispose;
    	const external_slot_template = /*$$slots*/ ctx[45].external;
    	const external_slot = create_slot(external_slot_template, ctx, /*$$scope*/ ctx[44], get_external_slot_context);
    	const default_slot_template = /*$$slots*/ ctx[45].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[44], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (external_slot) external_slot.c();
    			t0 = space();
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div3 = element("div");
    			attr_dev(div0, "class", div0_class_value = clsx("modal-content", /*contentClassName*/ ctx[7]));
    			add_location(div0, file$4, 229, 10, 5109);
    			attr_dev(div1, "class", /*classes*/ ctx[12]);
    			attr_dev(div1, "role", "document");
    			add_location(div1, file$4, 228, 8, 5041);
    			attr_dev(div2, "arialabelledby", /*labelledBy*/ ctx[3]);
    			attr_dev(div2, "class", div2_class_value = clsx("modal", "show", /*modalClassName*/ ctx[5]));
    			attr_dev(div2, "role", "dialog");
    			set_style(div2, "display", "block");
    			add_location(div2, file$4, 218, 6, 4658);
    			attr_dev(div3, "class", div3_class_value = clsx("modal-backdrop", "show", /*backdropClassName*/ ctx[6]));
    			add_location(div3, file$4, 235, 6, 5272);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (external_slot) {
    				external_slot.m(div0, null);
    			}

    			append_dev(div0, t0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div1_binding*/ ctx[46](div1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div3, anchor);
    			current = true;

    			dispose = [
    				listen_dev(div2, "introend", /*onModalOpened*/ ctx[15], false, false, false),
    				listen_dev(div2, "outroend", /*onModalClosed*/ ctx[16], false, false, false),
    				listen_dev(div2, "click", /*handleBackdropClick*/ ctx[14], false, false, false),
    				listen_dev(div2, "mousedown", /*handleBackdropMouseDown*/ ctx[17], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (external_slot && external_slot.p && dirty[1] & /*$$scope*/ 8192) {
    				external_slot.p(get_slot_context(external_slot_template, ctx, /*$$scope*/ ctx[44], get_external_slot_context), get_slot_changes(external_slot_template, /*$$scope*/ ctx[44], dirty, get_external_slot_changes));
    			}

    			if (default_slot && default_slot.p && dirty[1] & /*$$scope*/ 8192) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[44], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[44], dirty, null));
    			}

    			if (!current || dirty[0] & /*contentClassName*/ 128 && div0_class_value !== (div0_class_value = clsx("modal-content", /*contentClassName*/ ctx[7]))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty[0] & /*classes*/ 4096) {
    				attr_dev(div1, "class", /*classes*/ ctx[12]);
    			}

    			if (!current || dirty[0] & /*labelledBy*/ 8) {
    				attr_dev(div2, "arialabelledby", /*labelledBy*/ ctx[3]);
    			}

    			if (!current || dirty[0] & /*modalClassName*/ 32 && div2_class_value !== (div2_class_value = clsx("modal", "show", /*modalClassName*/ ctx[5]))) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty[0] & /*backdropClassName*/ 64 && div3_class_value !== (div3_class_value = clsx("modal-backdrop", "show", /*backdropClassName*/ ctx[6]))) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(external_slot, local);
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(
    					div2,
    					fade,
    					{
    						duration: /*fade*/ ctx[8] && /*duration*/ ctx[1]
    					},
    					true
    				);

    				div2_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(
    					div3,
    					fade,
    					{
    						duration: /*fade*/ ctx[8] && /*backdropDuration*/ ctx[2]
    					},
    					true
    				);

    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(external_slot, local);
    			transition_out(default_slot, local);

    			if (!div2_transition) div2_transition = create_bidirectional_transition(
    				div2,
    				fade,
    				{
    					duration: /*fade*/ ctx[8] && /*duration*/ ctx[1]
    				},
    				false
    			);

    			div2_transition.run(0);

    			if (!div3_transition) div3_transition = create_bidirectional_transition(
    				div3,
    				fade,
    				{
    					duration: /*fade*/ ctx[8] && /*backdropDuration*/ ctx[2]
    				},
    				false
    			);

    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (external_slot) external_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			/*div1_binding*/ ctx[46](null);
    			if (detaching && div2_transition) div2_transition.end();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div3);
    			if (detaching && div3_transition) div3_transition.end();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(218:4) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*_isMounted*/ ctx[10] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*_isMounted*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let openCount = 0;
    const dialogBaseClass = "modal-dialog";

    function noop$1() {
    	
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { isOpen } = $$props;
    	let { autoFocus = true } = $$props;
    	let { centered = false } = $$props;
    	let { duration = 0 } = $$props;
    	let { backdropDuration = duration } = $$props;
    	let { scrollable = false } = $$props;
    	let { size = "" } = $$props;
    	let { toggle = undefined } = $$props;
    	let { labelledBy = "" } = $$props;
    	let { backdrop = true } = $$props;
    	let { onEnter = undefined } = $$props;
    	let { onExit = undefined } = $$props;
    	let { onOpened = noop$1 } = $$props;
    	let { onClosed = noop$1 } = $$props;
    	let { wrapClassName = "" } = $$props;
    	let { modalClassName = "" } = $$props;
    	let { backdropClassName = "" } = $$props;
    	let { contentClassName = "" } = $$props;
    	let { fade = true } = $$props;
    	let { zIndex = 1050 } = $$props;
    	let { unmountOnClose = true } = $$props;
    	let { returnFocusAfterClose = true } = $$props;
    	const props = clean($$props);
    	let hasOpened = false;
    	let _isMounted = false;
    	let _triggeringElement;
    	let _originalBodyPadding;
    	let _lastIsOpen = isOpen;
    	let _lastHasOpened = hasOpened;
    	let _dialog;
    	let _mouseDownElement;
    	let _removeEscListener;

    	onMount(() => {
    		if (isOpen) {
    			init();
    			hasOpened = true;
    		}

    		if (typeof onEnter === "function") {
    			onEnter();
    		}

    		if (hasOpened && autoFocus) {
    			setFocus();
    		}
    	});

    	onDestroy(() => {
    		if (typeof onExit === "function") {
    			onExit();
    		}

    		destroy();

    		if (hasOpened) {
    			close();
    		}
    	});

    	afterUpdate(() => {
    		if (isOpen && !_lastIsOpen) {
    			init();
    			hasOpened = true;
    		}

    		if (autoFocus && hasOpened && !_lastHasOpened) {
    			setFocus();
    		}

    		_lastIsOpen = isOpen;
    		_lastHasOpened = hasOpened;
    	});

    	function setFocus() {
    		if (_dialog && _dialog.parentNode && typeof _dialog.parentNode.focus === "function") {
    			_dialog.parentNode.focus();
    		}
    	}

    	function init() {
    		try {
    			_triggeringElement = document.activeElement;
    		} catch(err) {
    			_triggeringElement = null;
    		}

    		_originalBodyPadding = getOriginalBodyPadding();
    		conditionallyUpdateScrollbar();

    		if (openCount === 0) {
    			document.body.className = clsx(document.body.className, "modal-open");
    		}

    		++openCount;
    		$$invalidate(10, _isMounted = true);
    	}

    	function manageFocusAfterClose() {
    		if (_triggeringElement) {
    			if (typeof _triggeringElement.focus === "function" && returnFocusAfterClose) {
    				_triggeringElement.focus();
    			}

    			_triggeringElement = null;
    		}
    	}

    	function destroy() {
    		manageFocusAfterClose();
    	}

    	function close() {
    		if (openCount <= 1) {
    			const modalOpenClassName = "modal-open";
    			const modalOpenClassNameRegex = new RegExp(`(^| )${modalOpenClassName}( |$)`);
    			document.body.className = document.body.className.replace(modalOpenClassNameRegex, " ").trim();
    		}

    		manageFocusAfterClose();
    		openCount = Math.max(0, openCount - 1);
    		setScrollbarWidth(_originalBodyPadding);
    	}

    	function handleBackdropClick(e) {
    		if (e.target === _mouseDownElement) {
    			e.stopPropagation();

    			if (!isOpen || !backdrop) {
    				return;
    			}

    			const backdropElem = _dialog ? _dialog.parentNode : null;

    			if (backdropElem && e.target === backdropElem && toggle) {
    				toggle(e);
    			}
    		}
    	}

    	function onModalOpened() {
    		_removeEscListener = browserEvent(document, "keydown", event => {
    			if (event.key && event.key === "Escape") {
    				toggle(event);
    			}
    		});

    		onOpened();
    	}

    	function onModalClosed() {
    		onClosed();

    		if (_removeEscListener) {
    			_removeEscListener();
    		}

    		if (unmountOnClose) {
    			destroy();
    		}

    		close();

    		if (_isMounted) {
    			hasOpened = false;
    		}

    		$$invalidate(10, _isMounted = false);
    	}

    	function handleBackdropMouseDown(e) {
    		_mouseDownElement = e.target;
    	}

    	let { $$slots = {}, $$scope } = $$props;

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(11, _dialog = $$value);
    		});
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate(43, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(18, className = $$new_props.class);
    		if ("isOpen" in $$new_props) $$invalidate(0, isOpen = $$new_props.isOpen);
    		if ("autoFocus" in $$new_props) $$invalidate(19, autoFocus = $$new_props.autoFocus);
    		if ("centered" in $$new_props) $$invalidate(20, centered = $$new_props.centered);
    		if ("duration" in $$new_props) $$invalidate(1, duration = $$new_props.duration);
    		if ("backdropDuration" in $$new_props) $$invalidate(2, backdropDuration = $$new_props.backdropDuration);
    		if ("scrollable" in $$new_props) $$invalidate(21, scrollable = $$new_props.scrollable);
    		if ("size" in $$new_props) $$invalidate(22, size = $$new_props.size);
    		if ("toggle" in $$new_props) $$invalidate(23, toggle = $$new_props.toggle);
    		if ("labelledBy" in $$new_props) $$invalidate(3, labelledBy = $$new_props.labelledBy);
    		if ("backdrop" in $$new_props) $$invalidate(24, backdrop = $$new_props.backdrop);
    		if ("onEnter" in $$new_props) $$invalidate(25, onEnter = $$new_props.onEnter);
    		if ("onExit" in $$new_props) $$invalidate(26, onExit = $$new_props.onExit);
    		if ("onOpened" in $$new_props) $$invalidate(27, onOpened = $$new_props.onOpened);
    		if ("onClosed" in $$new_props) $$invalidate(28, onClosed = $$new_props.onClosed);
    		if ("wrapClassName" in $$new_props) $$invalidate(4, wrapClassName = $$new_props.wrapClassName);
    		if ("modalClassName" in $$new_props) $$invalidate(5, modalClassName = $$new_props.modalClassName);
    		if ("backdropClassName" in $$new_props) $$invalidate(6, backdropClassName = $$new_props.backdropClassName);
    		if ("contentClassName" in $$new_props) $$invalidate(7, contentClassName = $$new_props.contentClassName);
    		if ("fade" in $$new_props) $$invalidate(8, fade = $$new_props.fade);
    		if ("zIndex" in $$new_props) $$invalidate(9, zIndex = $$new_props.zIndex);
    		if ("unmountOnClose" in $$new_props) $$invalidate(29, unmountOnClose = $$new_props.unmountOnClose);
    		if ("returnFocusAfterClose" in $$new_props) $$invalidate(30, returnFocusAfterClose = $$new_props.returnFocusAfterClose);
    		if ("$$scope" in $$new_props) $$invalidate(44, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			openCount,
    			className,
    			isOpen,
    			autoFocus,
    			centered,
    			duration,
    			backdropDuration,
    			scrollable,
    			size,
    			toggle,
    			labelledBy,
    			backdrop,
    			onEnter,
    			onExit,
    			onOpened,
    			onClosed,
    			wrapClassName,
    			modalClassName,
    			backdropClassName,
    			contentClassName,
    			fade,
    			zIndex,
    			unmountOnClose,
    			returnFocusAfterClose,
    			hasOpened,
    			_isMounted,
    			_triggeringElement,
    			_originalBodyPadding,
    			_lastIsOpen,
    			_lastHasOpened,
    			_dialog,
    			_mouseDownElement,
    			_removeEscListener,
    			classes
    		};
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(43, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(18, className = $$new_props.className);
    		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$new_props.isOpen);
    		if ("autoFocus" in $$props) $$invalidate(19, autoFocus = $$new_props.autoFocus);
    		if ("centered" in $$props) $$invalidate(20, centered = $$new_props.centered);
    		if ("duration" in $$props) $$invalidate(1, duration = $$new_props.duration);
    		if ("backdropDuration" in $$props) $$invalidate(2, backdropDuration = $$new_props.backdropDuration);
    		if ("scrollable" in $$props) $$invalidate(21, scrollable = $$new_props.scrollable);
    		if ("size" in $$props) $$invalidate(22, size = $$new_props.size);
    		if ("toggle" in $$props) $$invalidate(23, toggle = $$new_props.toggle);
    		if ("labelledBy" in $$props) $$invalidate(3, labelledBy = $$new_props.labelledBy);
    		if ("backdrop" in $$props) $$invalidate(24, backdrop = $$new_props.backdrop);
    		if ("onEnter" in $$props) $$invalidate(25, onEnter = $$new_props.onEnter);
    		if ("onExit" in $$props) $$invalidate(26, onExit = $$new_props.onExit);
    		if ("onOpened" in $$props) $$invalidate(27, onOpened = $$new_props.onOpened);
    		if ("onClosed" in $$props) $$invalidate(28, onClosed = $$new_props.onClosed);
    		if ("wrapClassName" in $$props) $$invalidate(4, wrapClassName = $$new_props.wrapClassName);
    		if ("modalClassName" in $$props) $$invalidate(5, modalClassName = $$new_props.modalClassName);
    		if ("backdropClassName" in $$props) $$invalidate(6, backdropClassName = $$new_props.backdropClassName);
    		if ("contentClassName" in $$props) $$invalidate(7, contentClassName = $$new_props.contentClassName);
    		if ("fade" in $$props) $$invalidate(8, fade = $$new_props.fade);
    		if ("zIndex" in $$props) $$invalidate(9, zIndex = $$new_props.zIndex);
    		if ("unmountOnClose" in $$props) $$invalidate(29, unmountOnClose = $$new_props.unmountOnClose);
    		if ("returnFocusAfterClose" in $$props) $$invalidate(30, returnFocusAfterClose = $$new_props.returnFocusAfterClose);
    		if ("hasOpened" in $$props) hasOpened = $$new_props.hasOpened;
    		if ("_isMounted" in $$props) $$invalidate(10, _isMounted = $$new_props._isMounted);
    		if ("_triggeringElement" in $$props) _triggeringElement = $$new_props._triggeringElement;
    		if ("_originalBodyPadding" in $$props) _originalBodyPadding = $$new_props._originalBodyPadding;
    		if ("_lastIsOpen" in $$props) _lastIsOpen = $$new_props._lastIsOpen;
    		if ("_lastHasOpened" in $$props) _lastHasOpened = $$new_props._lastHasOpened;
    		if ("_dialog" in $$props) $$invalidate(11, _dialog = $$new_props._dialog);
    		if ("_mouseDownElement" in $$props) _mouseDownElement = $$new_props._mouseDownElement;
    		if ("_removeEscListener" in $$props) _removeEscListener = $$new_props._removeEscListener;
    		if ("classes" in $$props) $$invalidate(12, classes = $$new_props.classes);
    	};

    	let classes;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*className, size, centered, scrollable*/ 7602176) {
    			 $$invalidate(12, classes = clsx(dialogBaseClass, className, {
    				[`modal-${size}`]: size,
    				[`${dialogBaseClass}-centered`]: centered,
    				[`${dialogBaseClass}-scrollable`]: scrollable
    			}));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		isOpen,
    		duration,
    		backdropDuration,
    		labelledBy,
    		wrapClassName,
    		modalClassName,
    		backdropClassName,
    		contentClassName,
    		fade,
    		zIndex,
    		_isMounted,
    		_dialog,
    		classes,
    		props,
    		handleBackdropClick,
    		onModalOpened,
    		onModalClosed,
    		handleBackdropMouseDown,
    		className,
    		autoFocus,
    		centered,
    		scrollable,
    		size,
    		toggle,
    		backdrop,
    		onEnter,
    		onExit,
    		onOpened,
    		onClosed,
    		unmountOnClose,
    		returnFocusAfterClose,
    		hasOpened,
    		_triggeringElement,
    		_originalBodyPadding,
    		_lastIsOpen,
    		_lastHasOpened,
    		_mouseDownElement,
    		_removeEscListener,
    		setFocus,
    		init,
    		manageFocusAfterClose,
    		destroy,
    		close,
    		$$props,
    		$$scope,
    		$$slots,
    		div1_binding
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$4,
    			create_fragment$4,
    			safe_not_equal,
    			{
    				class: 18,
    				isOpen: 0,
    				autoFocus: 19,
    				centered: 20,
    				duration: 1,
    				backdropDuration: 2,
    				scrollable: 21,
    				size: 22,
    				toggle: 23,
    				labelledBy: 3,
    				backdrop: 24,
    				onEnter: 25,
    				onExit: 26,
    				onOpened: 27,
    				onClosed: 28,
    				wrapClassName: 4,
    				modalClassName: 5,
    				backdropClassName: 6,
    				contentClassName: 7,
    				fade: 8,
    				zIndex: 9,
    				unmountOnClose: 29,
    				returnFocusAfterClose: 30
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*isOpen*/ ctx[0] === undefined && !("isOpen" in props)) {
    			console.warn("<Modal> was created without expected prop 'isOpen'");
    		}
    	}

    	get class() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoFocus() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoFocus(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centered() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centered(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backdropDuration() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backdropDuration(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollable() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollable(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggle() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggle(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelledBy() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelledBy(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backdrop() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backdrop(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onEnter() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onEnter(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onExit() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onExit(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onOpened() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onOpened(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClosed() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClosed(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapClassName() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapClassName(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modalClassName() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalClassName(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backdropClassName() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backdropClassName(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contentClassName() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contentClassName(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fade() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fade(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zIndex() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zIndex(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unmountOnClose() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unmountOnClose(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get returnFocusAfterClose() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set returnFocusAfterClose(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\ModalBody.svelte generated by Svelte v3.17.2 */
    const file$5 = "node_modules\\sveltestrap\\src\\ModalBody.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);
    	let div_levels = [/*props*/ ctx[1], { class: /*classes*/ ctx[0] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$5, 12, 0, 218);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 16) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[4], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null));
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*classes*/ 1 && { class: /*classes*/ ctx[0] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ("$$scope" in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { className, classes };
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(2, className = $$new_props.className);
    		if ("classes" in $$props) $$invalidate(0, classes = $$new_props.classes);
    	};

    	let classes;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className*/ 4) {
    			 $$invalidate(0, classes = clsx(className, "modal-body"));
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [classes, props, className, $$props, $$scope, $$slots];
    }

    class ModalBody extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { class: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModalBody",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get class() {
    		throw new Error("<ModalBody>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ModalBody>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\ModalFooter.svelte generated by Svelte v3.17.2 */
    const file$6 = "node_modules\\sveltestrap\\src\\ModalFooter.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);
    	let div_levels = [/*props*/ ctx[1], { class: /*classes*/ ctx[0] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$6, 12, 0, 220);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 16) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[4], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null));
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*classes*/ 1 && { class: /*classes*/ ctx[0] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ("$$scope" in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { className, classes };
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(2, className = $$new_props.className);
    		if ("classes" in $$props) $$invalidate(0, classes = $$new_props.classes);
    	};

    	let classes;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className*/ 4) {
    			 $$invalidate(0, classes = clsx(className, "modal-footer"));
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [classes, props, className, $$props, $$scope, $$slots];
    }

    class ModalFooter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { class: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModalFooter",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get class() {
    		throw new Error("<ModalFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ModalFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\ModalHeader.svelte generated by Svelte v3.17.2 */
    const file$7 = "node_modules\\sveltestrap\\src\\ModalHeader.svelte";
    const get_close_slot_changes = dirty => ({});
    const get_close_slot_context = ctx => ({});

    // (24:4) {:else}
    function create_else_block$1(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 512) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[9], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(24:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#if children}
    function create_if_block_1$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*children*/ ctx[2]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 4) set_data_dev(t, /*children*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(22:4) {#if children}",
    		ctx
    	});

    	return block;
    }

    // (29:4) {#if typeof toggle === 'function'}
    function create_if_block$3(ctx) {
    	let button;
    	let span;
    	let t;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			t = text(/*closeIcon*/ ctx[3]);
    			attr_dev(span, "aria-hidden", "true");
    			add_location(span, file$7, 34, 8, 782);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "close");
    			attr_dev(button, "aria-label", /*closeAriaLabel*/ ctx[1]);
    			add_location(button, file$7, 29, 6, 659);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);
    			append_dev(span, t);
    			dispose = listen_dev(button, "click", /*toggle*/ ctx[0], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*closeIcon*/ 8) set_data_dev(t, /*closeIcon*/ ctx[3]);

    			if (dirty & /*closeAriaLabel*/ 2) {
    				attr_dev(button, "aria-label", /*closeAriaLabel*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(29:4) {#if typeof toggle === 'function'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let h5;
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let current;
    	const if_block_creators = [create_if_block_1$3, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*children*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const close_slot_template = /*$$slots*/ ctx[10].close;
    	const close_slot = create_slot(close_slot_template, ctx, /*$$scope*/ ctx[9], get_close_slot_context);
    	let if_block1 = typeof /*toggle*/ ctx[0] === "function" && create_if_block$3(ctx);
    	let div_levels = [/*props*/ ctx[5], { class: /*classes*/ ctx[4] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h5 = element("h5");
    			if_block0.c();
    			t = space();

    			if (!close_slot) {
    				if (if_block1) if_block1.c();
    			}

    			if (close_slot) close_slot.c();
    			attr_dev(h5, "class", "modal-title");
    			add_location(h5, file$7, 20, 2, 486);
    			set_attributes(div, div_data);
    			add_location(div, file$7, 19, 0, 451);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h5);
    			if_blocks[current_block_type_index].m(h5, null);
    			append_dev(div, t);

    			if (!close_slot) {
    				if (if_block1) if_block1.m(div, null);
    			}

    			if (close_slot) {
    				close_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(h5, null);
    			}

    			if (!close_slot) {
    				if (typeof /*toggle*/ ctx[0] === "function") {
    					if (if_block1) {
    						if_block1.p(ctx, dirty);
    					} else {
    						if_block1 = create_if_block$3(ctx);
    						if_block1.c();
    						if_block1.m(div, null);
    					}
    				} else if (if_block1) {
    					if_block1.d(1);
    					if_block1 = null;
    				}
    			}

    			if (close_slot && close_slot.p && dirty & /*$$scope*/ 512) {
    				close_slot.p(get_slot_context(close_slot_template, ctx, /*$$scope*/ ctx[9], get_close_slot_context), get_slot_changes(close_slot_template, /*$$scope*/ ctx[9], dirty, get_close_slot_changes));
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				dirty & /*props*/ 32 && /*props*/ ctx[5],
    				dirty & /*classes*/ 16 && { class: /*classes*/ ctx[4] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(close_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(close_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();

    			if (!close_slot) {
    				if (if_block1) if_block1.d();
    			}

    			if (close_slot) close_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { toggle = undefined } = $$props;
    	let { closeAriaLabel = "Close" } = $$props;
    	let { charCode = 215 } = $$props;
    	let { children = undefined } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(6, className = $$new_props.class);
    		if ("toggle" in $$new_props) $$invalidate(0, toggle = $$new_props.toggle);
    		if ("closeAriaLabel" in $$new_props) $$invalidate(1, closeAriaLabel = $$new_props.closeAriaLabel);
    		if ("charCode" in $$new_props) $$invalidate(7, charCode = $$new_props.charCode);
    		if ("children" in $$new_props) $$invalidate(2, children = $$new_props.children);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			className,
    			toggle,
    			closeAriaLabel,
    			charCode,
    			children,
    			closeIcon,
    			classes
    		};
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(6, className = $$new_props.className);
    		if ("toggle" in $$props) $$invalidate(0, toggle = $$new_props.toggle);
    		if ("closeAriaLabel" in $$props) $$invalidate(1, closeAriaLabel = $$new_props.closeAriaLabel);
    		if ("charCode" in $$props) $$invalidate(7, charCode = $$new_props.charCode);
    		if ("children" in $$props) $$invalidate(2, children = $$new_props.children);
    		if ("closeIcon" in $$props) $$invalidate(3, closeIcon = $$new_props.closeIcon);
    		if ("classes" in $$props) $$invalidate(4, classes = $$new_props.classes);
    	};

    	let closeIcon;
    	let classes;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*charCode*/ 128) {
    			 $$invalidate(3, closeIcon = typeof charCode === "number"
    			? String.fromCharCode(charCode)
    			: charCode);
    		}

    		if ($$self.$$.dirty & /*className*/ 64) {
    			 $$invalidate(4, classes = clsx(className, "modal-header"));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		toggle,
    		closeAriaLabel,
    		children,
    		closeIcon,
    		classes,
    		props,
    		className,
    		charCode,
    		$$props,
    		$$scope,
    		$$slots
    	];
    }

    class ModalHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			class: 6,
    			toggle: 0,
    			closeAriaLabel: 1,
    			charCode: 7,
    			children: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModalHeader",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get class() {
    		throw new Error("<ModalHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ModalHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggle() {
    		throw new Error("<ModalHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggle(value) {
    		throw new Error("<ModalHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeAriaLabel() {
    		throw new Error("<ModalHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeAriaLabel(value) {
    		throw new Error("<ModalHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get charCode() {
    		throw new Error("<ModalHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charCode(value) {
    		throw new Error("<ModalHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get children() {
    		throw new Error("<ModalHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set children(value) {
    		throw new Error("<ModalHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\Table.svelte generated by Svelte v3.17.2 */
    const file$8 = "node_modules\\sveltestrap\\src\\Table.svelte";

    // (38:0) {:else}
    function create_else_block$2(ctx) {
    	let table;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
    	let table_levels = [/*props*/ ctx[3], { class: /*classes*/ ctx[1] }];
    	let table_data = {};

    	for (let i = 0; i < table_levels.length; i += 1) {
    		table_data = assign(table_data, table_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			if (default_slot) default_slot.c();
    			set_attributes(table, table_data);
    			add_location(table, file$8, 38, 2, 908);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);

    			if (default_slot) {
    				default_slot.m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 4096) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[12], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null));
    			}

    			set_attributes(table, get_spread_update(table_levels, [
    				dirty & /*props*/ 8 && /*props*/ ctx[3],
    				dirty & /*classes*/ 2 && { class: /*classes*/ ctx[1] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(38:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (32:0) {#if responsive}
    function create_if_block$4(ctx) {
    	let div;
    	let table;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
    	let table_levels = [/*props*/ ctx[3], { class: /*classes*/ ctx[1] }];
    	let table_data = {};

    	for (let i = 0; i < table_levels.length; i += 1) {
    		table_data = assign(table_data, table_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			table = element("table");
    			if (default_slot) default_slot.c();
    			set_attributes(table, table_data);
    			add_location(table, file$8, 33, 4, 826);
    			attr_dev(div, "class", /*responsiveClassName*/ ctx[2]);
    			add_location(div, file$8, 32, 2, 788);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, table);

    			if (default_slot) {
    				default_slot.m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 4096) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[12], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null));
    			}

    			set_attributes(table, get_spread_update(table_levels, [
    				dirty & /*props*/ 8 && /*props*/ ctx[3],
    				dirty & /*classes*/ 2 && { class: /*classes*/ ctx[1] }
    			]));

    			if (!current || dirty & /*responsiveClassName*/ 4) {
    				attr_dev(div, "class", /*responsiveClassName*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(32:0) {#if responsive}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*responsive*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { size = "" } = $$props;
    	let { bordered = false } = $$props;
    	let { borderless = false } = $$props;
    	let { striped = false } = $$props;
    	let { dark = false } = $$props;
    	let { hover = false } = $$props;
    	let { responsive = false } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(4, className = $$new_props.class);
    		if ("size" in $$new_props) $$invalidate(5, size = $$new_props.size);
    		if ("bordered" in $$new_props) $$invalidate(6, bordered = $$new_props.bordered);
    		if ("borderless" in $$new_props) $$invalidate(7, borderless = $$new_props.borderless);
    		if ("striped" in $$new_props) $$invalidate(8, striped = $$new_props.striped);
    		if ("dark" in $$new_props) $$invalidate(9, dark = $$new_props.dark);
    		if ("hover" in $$new_props) $$invalidate(10, hover = $$new_props.hover);
    		if ("responsive" in $$new_props) $$invalidate(0, responsive = $$new_props.responsive);
    		if ("$$scope" in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			className,
    			size,
    			bordered,
    			borderless,
    			striped,
    			dark,
    			hover,
    			responsive,
    			classes,
    			responsiveClassName
    		};
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(4, className = $$new_props.className);
    		if ("size" in $$props) $$invalidate(5, size = $$new_props.size);
    		if ("bordered" in $$props) $$invalidate(6, bordered = $$new_props.bordered);
    		if ("borderless" in $$props) $$invalidate(7, borderless = $$new_props.borderless);
    		if ("striped" in $$props) $$invalidate(8, striped = $$new_props.striped);
    		if ("dark" in $$props) $$invalidate(9, dark = $$new_props.dark);
    		if ("hover" in $$props) $$invalidate(10, hover = $$new_props.hover);
    		if ("responsive" in $$props) $$invalidate(0, responsive = $$new_props.responsive);
    		if ("classes" in $$props) $$invalidate(1, classes = $$new_props.classes);
    		if ("responsiveClassName" in $$props) $$invalidate(2, responsiveClassName = $$new_props.responsiveClassName);
    	};

    	let classes;
    	let responsiveClassName;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, size, bordered, borderless, striped, dark, hover*/ 2032) {
    			 $$invalidate(1, classes = clsx(className, "table", size ? "table-" + size : false, bordered ? "table-bordered" : false, borderless ? "table-borderless" : false, striped ? "table-striped" : false, dark ? "table-dark" : false, hover ? "table-hover" : false));
    		}

    		if ($$self.$$.dirty & /*responsive*/ 1) {
    			 $$invalidate(2, responsiveClassName = responsive === true
    			? "table-responsive"
    			: `table-responsive-${responsive}`);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		responsive,
    		classes,
    		responsiveClassName,
    		props,
    		className,
    		size,
    		bordered,
    		borderless,
    		striped,
    		dark,
    		hover,
    		$$props,
    		$$scope,
    		$$slots
    	];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			class: 4,
    			size: 5,
    			bordered: 6,
    			borderless: 7,
    			striped: 8,
    			dark: 9,
    			hover: 10,
    			responsive: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get class() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bordered() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bordered(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderless() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderless(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get striped() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set striped(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dark() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dark(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hover() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get responsive() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set responsive(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.html generated by Svelte v3.17.2 */
    const file$9 = "src\\App.html";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	return child_ctx;
    }

    // (145:3) <Button color="success" on:click={addtoggle}>
    function create_default_slot_24(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add Book");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_24.name,
    		type: "slot",
    		source: "(145:3) <Button color=\\\"success\\\" on:click={addtoggle}>",
    		ctx
    	});

    	return block;
    }

    // (148:5) <Button color="success" active={mongoactive} outline={postgresactive} on:click={setMongo}>
    function create_default_slot_23(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("MongoDB");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_23.name,
    		type: "slot",
    		source: "(148:5) <Button color=\\\"success\\\" active={mongoactive} outline={postgresactive} on:click={setMongo}>",
    		ctx
    	});

    	return block;
    }

    // (149:5) <Button color="primary" active={postgresactive} outline={mongoactive} on:click={setPostgres}>
    function create_default_slot_22(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("PostgreSQL");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_22.name,
    		type: "slot",
    		source: "(149:5) <Button color=\\\"primary\\\" active={postgresactive} outline={mongoactive} on:click={setPostgres}>",
    		ctx
    	});

    	return block;
    }

    // (147:4) <ButtonGroup>
    function create_default_slot_21(ctx) {
    	let t;
    	let current;

    	const button0 = new Button({
    			props: {
    				color: "success",
    				active: /*mongoactive*/ ctx[3],
    				outline: /*postgresactive*/ ctx[4],
    				$$slots: { default: [create_default_slot_23] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*setMongo*/ ctx[7]);

    	const button1 = new Button({
    			props: {
    				color: "primary",
    				active: /*postgresactive*/ ctx[4],
    				outline: /*mongoactive*/ ctx[3],
    				$$slots: { default: [create_default_slot_22] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*setPostgres*/ ctx[8]);

    	const block = {
    		c: function create() {
    			create_component(button0.$$.fragment);
    			t = space();
    			create_component(button1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(button1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};
    			if (dirty & /*mongoactive*/ 8) button0_changes.active = /*mongoactive*/ ctx[3];
    			if (dirty & /*postgresactive*/ 16) button0_changes.outline = /*postgresactive*/ ctx[4];

    			if (dirty & /*$$scope*/ 134217728) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};
    			if (dirty & /*postgresactive*/ 16) button1_changes.active = /*postgresactive*/ ctx[4];
    			if (dirty & /*mongoactive*/ 8) button1_changes.outline = /*mongoactive*/ ctx[3];

    			if (dirty & /*$$scope*/ 134217728) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(button1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_21.name,
    		type: "slot",
    		source: "(147:4) <ButtonGroup>",
    		ctx
    	});

    	return block;
    }

    // (169:6) <Button color="warning" on:click={editBook({ book })}>
    function create_default_slot_20(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Update");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_20.name,
    		type: "slot",
    		source: "(169:6) <Button color=\\\"warning\\\" on:click={editBook({ book })}>",
    		ctx
    	});

    	return block;
    }

    // (170:6) <Button color="danger" on:click={removeBook({ book })}>
    function create_default_slot_19(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Delete");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_19.name,
    		type: "slot",
    		source: "(170:6) <Button color=\\\"danger\\\" on:click={removeBook({ book })}>",
    		ctx
    	});

    	return block;
    }

    // (163:5) {#each books as book}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*book*/ ctx[24].title + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*book*/ ctx[24].author + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*book*/ ctx[24].description + "";
    	let t4;
    	let t5;
    	let td3;
    	let span;
    	let t6;
    	let t7;
    	let tr_transition;
    	let current;

    	const button0 = new Button({
    			props: {
    				color: "warning",
    				$$slots: { default: [create_default_slot_20] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", function () {
    		if (is_function(/*editBook*/ ctx[11]({ book: /*book*/ ctx[24] }))) /*editBook*/ ctx[11]({ book: /*book*/ ctx[24] }).apply(this, arguments);
    	});

    	const button1 = new Button({
    			props: {
    				color: "danger",
    				$$slots: { default: [create_default_slot_19] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", function () {
    		if (is_function(/*removeBook*/ ctx[9]({ book: /*book*/ ctx[24] }))) /*removeBook*/ ctx[9]({ book: /*book*/ ctx[24] }).apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			span = element("span");
    			create_component(button0.$$.fragment);
    			t6 = space();
    			create_component(button1.$$.fragment);
    			t7 = space();
    			add_location(td0, file$9, 164, 5, 3266);
    			add_location(td1, file$9, 165, 5, 3295);
    			add_location(td2, file$9, 166, 5, 3325);
    			set_style(span, "float", "right");
    			add_location(span, file$9, 167, 9, 3364);
    			add_location(td3, file$9, 167, 5, 3360);
    			add_location(tr, file$9, 163, 4, 3212);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, span);
    			mount_component(button0, span, null);
    			append_dev(span, t6);
    			mount_component(button1, span, null);
    			append_dev(tr, t7);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*books*/ 1) && t0_value !== (t0_value = /*book*/ ctx[24].title + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*books*/ 1) && t2_value !== (t2_value = /*book*/ ctx[24].author + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*books*/ 1) && t4_value !== (t4_value = /*book*/ ctx[24].description + "")) set_data_dev(t4, t4_value);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);

    			add_render_callback(() => {
    				if (!tr_transition) tr_transition = create_bidirectional_transition(tr, fly, { y: 48, duration: 200 }, true);
    				tr_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			if (!tr_transition) tr_transition = create_bidirectional_transition(tr, fly, { y: 48, duration: 200 }, false);
    			tr_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(button0);
    			destroy_component(button1);
    			if (detaching && tr_transition) tr_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(163:5) {#each books as book}",
    		ctx
    	});

    	return block;
    }

    // (153:3) <Table hover>
    function create_default_slot_18(ctx) {
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t6;
    	let tbody;
    	let current;
    	let each_value = /*books*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Title";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Author";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Description";
    			t5 = space();
    			th3 = element("th");
    			t6 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "scope", "col");
    			add_location(th0, file$9, 155, 6, 3029);
    			attr_dev(th1, "scope", "col");
    			add_location(th1, file$9, 156, 6, 3062);
    			attr_dev(th2, "scope", "col");
    			add_location(th2, file$9, 157, 6, 3096);
    			add_location(th3, file$9, 158, 6, 3135);
    			add_location(tr, file$9, 154, 5, 3018);
    			add_location(thead, file$9, 153, 4, 3005);
    			add_location(tbody, file$9, 161, 4, 3173);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, tbody, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*removeBook, books, editBook*/ 2561) {
    				each_value = /*books*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(tbody);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_18.name,
    		type: "slot",
    		source: "(153:3) <Table hover>",
    		ctx
    	});

    	return block;
    }

    // (180:2) <ModalHeader {addtoggle}>
    function create_default_slot_17(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add a new book");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_17.name,
    		type: "slot",
    		source: "(180:2) <ModalHeader {addtoggle}>",
    		ctx
    	});

    	return block;
    }

    // (182:4) <Label for="newTitle">
    function create_default_slot_16(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Title:");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_16.name,
    		type: "slot",
    		source: "(182:4) <Label for=\\\"newTitle\\\">",
    		ctx
    	});

    	return block;
    }

    // (185:3) <Label for="newAuthor">
    function create_default_slot_15(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Author:");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_15.name,
    		type: "slot",
    		source: "(185:3) <Label for=\\\"newAuthor\\\">",
    		ctx
    	});

    	return block;
    }

    // (188:3) <Label for="newTitle">
    function create_default_slot_14(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Description:");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14.name,
    		type: "slot",
    		source: "(188:3) <Label for=\\\"newTitle\\\">",
    		ctx
    	});

    	return block;
    }

    // (181:2) <ModalBody>
    function create_default_slot_13(ctx) {
    	let t0;
    	let updating_value;
    	let t1;
    	let p0;
    	let t2;
    	let t3;
    	let updating_value_1;
    	let t4;
    	let p1;
    	let t5;
    	let t6;
    	let updating_value_2;
    	let current;

    	const label0 = new Label({
    			props: {
    				for: "newTitle",
    				$$slots: { default: [create_default_slot_16] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function input0_value_binding(value) {
    		/*input0_value_binding*/ ctx[18].call(null, value);
    	}

    	let input0_props = { type: "text", placeholder: "book title" };

    	if (/*addBookForm*/ ctx[1].title !== void 0) {
    		input0_props.value = /*addBookForm*/ ctx[1].title;
    	}

    	const input0 = new Input({ props: input0_props, $$inline: true });
    	binding_callbacks.push(() => bind(input0, "value", input0_value_binding));

    	const label1 = new Label({
    			props: {
    				for: "newAuthor",
    				$$slots: { default: [create_default_slot_15] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function input1_value_binding(value_1) {
    		/*input1_value_binding*/ ctx[19].call(null, value_1);
    	}

    	let input1_props = { type: "text", placeholder: "book author" };

    	if (/*addBookForm*/ ctx[1].author !== void 0) {
    		input1_props.value = /*addBookForm*/ ctx[1].author;
    	}

    	const input1 = new Input({ props: input1_props, $$inline: true });
    	binding_callbacks.push(() => bind(input1, "value", input1_value_binding));

    	const label2 = new Label({
    			props: {
    				for: "newTitle",
    				$$slots: { default: [create_default_slot_14] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function input2_value_binding(value_2) {
    		/*input2_value_binding*/ ctx[20].call(null, value_2);
    	}

    	let input2_props = {
    		type: "text",
    		placeholder: "book description"
    	};

    	if (/*addBookForm*/ ctx[1].description !== void 0) {
    		input2_props.value = /*addBookForm*/ ctx[1].description;
    	}

    	const input2 = new Input({ props: input2_props, $$inline: true });
    	binding_callbacks.push(() => bind(input2, "value", input2_value_binding));

    	const block = {
    		c: function create() {
    			create_component(label0.$$.fragment);
    			t0 = space();
    			create_component(input0.$$.fragment);
    			t1 = space();
    			p0 = element("p");
    			t2 = space();
    			create_component(label1.$$.fragment);
    			t3 = space();
    			create_component(input1.$$.fragment);
    			t4 = space();
    			p1 = element("p");
    			t5 = space();
    			create_component(label2.$$.fragment);
    			t6 = space();
    			create_component(input2.$$.fragment);
    			add_location(p0, file$9, 183, 3, 3878);
    			add_location(p1, file$9, 186, 3, 4014);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(input0, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(label1, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(input1, target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(label2, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(input2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label0_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				label0_changes.$$scope = { dirty, ctx };
    			}

    			label0.$set(label0_changes);
    			const input0_changes = {};

    			if (!updating_value && dirty & /*addBookForm*/ 2) {
    				updating_value = true;
    				input0_changes.value = /*addBookForm*/ ctx[1].title;
    				add_flush_callback(() => updating_value = false);
    			}

    			input0.$set(input0_changes);
    			const label1_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				label1_changes.$$scope = { dirty, ctx };
    			}

    			label1.$set(label1_changes);
    			const input1_changes = {};

    			if (!updating_value_1 && dirty & /*addBookForm*/ 2) {
    				updating_value_1 = true;
    				input1_changes.value = /*addBookForm*/ ctx[1].author;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			input1.$set(input1_changes);
    			const label2_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				label2_changes.$$scope = { dirty, ctx };
    			}

    			label2.$set(label2_changes);
    			const input2_changes = {};

    			if (!updating_value_2 && dirty & /*addBookForm*/ 2) {
    				updating_value_2 = true;
    				input2_changes.value = /*addBookForm*/ ctx[1].description;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			input2.$set(input2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label0.$$.fragment, local);
    			transition_in(input0.$$.fragment, local);
    			transition_in(label1.$$.fragment, local);
    			transition_in(input1.$$.fragment, local);
    			transition_in(label2.$$.fragment, local);
    			transition_in(input2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label0.$$.fragment, local);
    			transition_out(input0.$$.fragment, local);
    			transition_out(label1.$$.fragment, local);
    			transition_out(input1.$$.fragment, local);
    			transition_out(label2.$$.fragment, local);
    			transition_out(input2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(input0, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t2);
    			destroy_component(label1, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(input1, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t5);
    			destroy_component(label2, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(input2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(181:2) <ModalBody>",
    		ctx
    	});

    	return block;
    }

    // (192:3) <Button color="primary" on:click={addBook}>
    function create_default_slot_12(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add book");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(192:3) <Button color=\\\"primary\\\" on:click={addBook}>",
    		ctx
    	});

    	return block;
    }

    // (195:3) <Button color="secondary" on:click={addtoggle}>
    function create_default_slot_11(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Cancel");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(195:3) <Button color=\\\"secondary\\\" on:click={addtoggle}>",
    		ctx
    	});

    	return block;
    }

    // (191:2) <ModalFooter>
    function create_default_slot_10(ctx) {
    	let t;
    	let current;

    	const button0 = new Button({
    			props: {
    				color: "primary",
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*addBook*/ ctx[10]);

    	const button1 = new Button({
    			props: {
    				color: "secondary",
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*addtoggle*/ ctx[13]);

    	const block = {
    		c: function create() {
    			create_component(button0.$$.fragment);
    			t = space();
    			create_component(button1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(button1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(button1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(191:2) <ModalFooter>",
    		ctx
    	});

    	return block;
    }

    // (179:1) <Modal isOpen={addopen} {addtoggle}>
    function create_default_slot_9(ctx) {
    	let t0;
    	let t1;
    	let current;

    	const modalheader = new ModalHeader({
    			props: {
    				addtoggle: /*addtoggle*/ ctx[13],
    				$$slots: { default: [create_default_slot_17] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modalbody = new ModalBody({
    			props: {
    				$$slots: { default: [create_default_slot_13] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modalfooter = new ModalFooter({
    			props: {
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modalheader.$$.fragment);
    			t0 = space();
    			create_component(modalbody.$$.fragment);
    			t1 = space();
    			create_component(modalfooter.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modalheader, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modalbody, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modalfooter, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modalheader_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				modalheader_changes.$$scope = { dirty, ctx };
    			}

    			modalheader.$set(modalheader_changes);
    			const modalbody_changes = {};

    			if (dirty & /*$$scope, addBookForm*/ 134217730) {
    				modalbody_changes.$$scope = { dirty, ctx };
    			}

    			modalbody.$set(modalbody_changes);
    			const modalfooter_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				modalfooter_changes.$$scope = { dirty, ctx };
    			}

    			modalfooter.$set(modalfooter_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modalheader.$$.fragment, local);
    			transition_in(modalbody.$$.fragment, local);
    			transition_in(modalfooter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modalheader.$$.fragment, local);
    			transition_out(modalbody.$$.fragment, local);
    			transition_out(modalfooter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modalheader, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modalbody, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modalfooter, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(179:1) <Modal isOpen={addopen} {addtoggle}>",
    		ctx
    	});

    	return block;
    }

    // (201:2) <ModalHeader {updatetoggle}>
    function create_default_slot_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Update book");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(201:2) <ModalHeader {updatetoggle}>",
    		ctx
    	});

    	return block;
    }

    // (203:3) <Label for="newTitle">
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Title:");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(203:3) <Label for=\\\"newTitle\\\">",
    		ctx
    	});

    	return block;
    }

    // (206:3) <Label for="newAuthor">
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Author:");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(206:3) <Label for=\\\"newAuthor\\\">",
    		ctx
    	});

    	return block;
    }

    // (209:3) <Label for="newTitle">
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Description:");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(209:3) <Label for=\\\"newTitle\\\">",
    		ctx
    	});

    	return block;
    }

    // (202:2) <ModalBody>
    function create_default_slot_4(ctx) {
    	let t0;
    	let updating_value;
    	let t1;
    	let p0;
    	let t2;
    	let t3;
    	let updating_value_1;
    	let t4;
    	let p1;
    	let t5;
    	let t6;
    	let updating_value_2;
    	let current;

    	const label0 = new Label({
    			props: {
    				for: "newTitle",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function input0_value_binding_1(value) {
    		/*input0_value_binding_1*/ ctx[21].call(null, value);
    	}

    	let input0_props = { type: "text", placeholder: "book title" };

    	if (/*editForm*/ ctx[2].title !== void 0) {
    		input0_props.value = /*editForm*/ ctx[2].title;
    	}

    	const input0 = new Input({ props: input0_props, $$inline: true });
    	binding_callbacks.push(() => bind(input0, "value", input0_value_binding_1));

    	const label1 = new Label({
    			props: {
    				for: "newAuthor",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function input1_value_binding_1(value_1) {
    		/*input1_value_binding_1*/ ctx[22].call(null, value_1);
    	}

    	let input1_props = { type: "text", placeholder: "book author" };

    	if (/*editForm*/ ctx[2].author !== void 0) {
    		input1_props.value = /*editForm*/ ctx[2].author;
    	}

    	const input1 = new Input({ props: input1_props, $$inline: true });
    	binding_callbacks.push(() => bind(input1, "value", input1_value_binding_1));

    	const label2 = new Label({
    			props: {
    				for: "newTitle",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function input2_value_binding_1(value_2) {
    		/*input2_value_binding_1*/ ctx[23].call(null, value_2);
    	}

    	let input2_props = {
    		type: "text",
    		placeholder: "book description"
    	};

    	if (/*editForm*/ ctx[2].description !== void 0) {
    		input2_props.value = /*editForm*/ ctx[2].description;
    	}

    	const input2 = new Input({ props: input2_props, $$inline: true });
    	binding_callbacks.push(() => bind(input2, "value", input2_value_binding_1));

    	const block = {
    		c: function create() {
    			create_component(label0.$$.fragment);
    			t0 = space();
    			create_component(input0.$$.fragment);
    			t1 = space();
    			p0 = element("p");
    			t2 = space();
    			create_component(label1.$$.fragment);
    			t3 = space();
    			create_component(input1.$$.fragment);
    			t4 = space();
    			p1 = element("p");
    			t5 = space();
    			create_component(label2.$$.fragment);
    			t6 = space();
    			create_component(input2.$$.fragment);
    			add_location(p0, file$9, 204, 3, 4601);
    			add_location(p1, file$9, 207, 3, 4733);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(input0, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(label1, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(input1, target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(label2, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(input2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label0_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				label0_changes.$$scope = { dirty, ctx };
    			}

    			label0.$set(label0_changes);
    			const input0_changes = {};

    			if (!updating_value && dirty & /*editForm*/ 4) {
    				updating_value = true;
    				input0_changes.value = /*editForm*/ ctx[2].title;
    				add_flush_callback(() => updating_value = false);
    			}

    			input0.$set(input0_changes);
    			const label1_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				label1_changes.$$scope = { dirty, ctx };
    			}

    			label1.$set(label1_changes);
    			const input1_changes = {};

    			if (!updating_value_1 && dirty & /*editForm*/ 4) {
    				updating_value_1 = true;
    				input1_changes.value = /*editForm*/ ctx[2].author;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			input1.$set(input1_changes);
    			const label2_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				label2_changes.$$scope = { dirty, ctx };
    			}

    			label2.$set(label2_changes);
    			const input2_changes = {};

    			if (!updating_value_2 && dirty & /*editForm*/ 4) {
    				updating_value_2 = true;
    				input2_changes.value = /*editForm*/ ctx[2].description;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			input2.$set(input2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label0.$$.fragment, local);
    			transition_in(input0.$$.fragment, local);
    			transition_in(label1.$$.fragment, local);
    			transition_in(input1.$$.fragment, local);
    			transition_in(label2.$$.fragment, local);
    			transition_in(input2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label0.$$.fragment, local);
    			transition_out(input0.$$.fragment, local);
    			transition_out(label1.$$.fragment, local);
    			transition_out(input1.$$.fragment, local);
    			transition_out(label2.$$.fragment, local);
    			transition_out(input2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(input0, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t2);
    			destroy_component(label1, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(input1, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t5);
    			destroy_component(label2, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(input2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(202:2) <ModalBody>",
    		ctx
    	});

    	return block;
    }

    // (213:3) <Button color="primary" on:click={updateBook}>
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Update");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(213:3) <Button color=\\\"primary\\\" on:click={updateBook}>",
    		ctx
    	});

    	return block;
    }

    // (216:3) <Button color="secondary" on:click={updatetoggle}>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Cancel");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(216:3) <Button color=\\\"secondary\\\" on:click={updatetoggle}>",
    		ctx
    	});

    	return block;
    }

    // (212:2) <ModalFooter>
    function create_default_slot_1(ctx) {
    	let t;
    	let current;

    	const button0 = new Button({
    			props: {
    				color: "primary",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*updateBook*/ ctx[12]);

    	const button1 = new Button({
    			props: {
    				color: "secondary",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*updatetoggle*/ ctx[14]);

    	const block = {
    		c: function create() {
    			create_component(button0.$$.fragment);
    			t = space();
    			create_component(button1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(button1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(button1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(212:2) <ModalFooter>",
    		ctx
    	});

    	return block;
    }

    // (200:1) <Modal isOpen={updateopen} {updatetoggle}>
    function create_default_slot(ctx) {
    	let t0;
    	let t1;
    	let current;

    	const modalheader = new ModalHeader({
    			props: {
    				updatetoggle: /*updatetoggle*/ ctx[14],
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modalbody = new ModalBody({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modalfooter = new ModalFooter({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modalheader.$$.fragment);
    			t0 = space();
    			create_component(modalbody.$$.fragment);
    			t1 = space();
    			create_component(modalfooter.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modalheader, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modalbody, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modalfooter, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modalheader_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				modalheader_changes.$$scope = { dirty, ctx };
    			}

    			modalheader.$set(modalheader_changes);
    			const modalbody_changes = {};

    			if (dirty & /*$$scope, editForm*/ 134217732) {
    				modalbody_changes.$$scope = { dirty, ctx };
    			}

    			modalbody.$set(modalbody_changes);
    			const modalfooter_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				modalfooter_changes.$$scope = { dirty, ctx };
    			}

    			modalfooter.$set(modalfooter_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modalheader.$$.fragment, local);
    			transition_in(modalbody.$$.fragment, local);
    			transition_in(modalfooter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modalheader.$$.fragment, local);
    			transition_out(modalbody.$$.fragment, local);
    			transition_out(modalfooter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modalheader, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modalbody, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modalfooter, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(200:1) <Modal isOpen={updateopen} {updatetoggle}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let link;
    	let t0;
    	let div2;
    	let div1;
    	let div0;
    	let h1;
    	let t2;
    	let hr;
    	let br0;
    	let t3;
    	let t4;
    	let span;
    	let t5;
    	let br1;
    	let br2;
    	let t6;
    	let t7;
    	let t8;
    	let current;

    	const button = new Button({
    			props: {
    				color: "success",
    				$$slots: { default: [create_default_slot_24] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*addtoggle*/ ctx[13]);

    	const buttongroup = new ButtonGroup({
    			props: {
    				$$slots: { default: [create_default_slot_21] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const table = new Table({
    			props: {
    				hover: true,
    				$$slots: { default: [create_default_slot_18] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal0 = new Modal({
    			props: {
    				isOpen: /*addopen*/ ctx[5],
    				addtoggle: /*addtoggle*/ ctx[13],
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal1 = new Modal({
    			props: {
    				isOpen: /*updateopen*/ ctx[6],
    				updatetoggle: /*updatetoggle*/ ctx[14],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Books";
    			t2 = space();
    			hr = element("hr");
    			br0 = element("br");
    			t3 = space();
    			create_component(button.$$.fragment);
    			t4 = space();
    			span = element("span");
    			create_component(buttongroup.$$.fragment);
    			t5 = space();
    			br1 = element("br");
    			br2 = element("br");
    			t6 = space();
    			create_component(table.$$.fragment);
    			t7 = space();
    			create_component(modal0.$$.fragment);
    			t8 = space();
    			create_component(modal1.$$.fragment);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css");
    			add_location(link, file$9, 136, 1, 2395);
    			add_location(h1, file$9, 142, 3, 2569);
    			add_location(hr, file$9, 143, 3, 2587);
    			add_location(br0, file$9, 143, 7, 2591);
    			set_style(span, "float", "right");
    			add_location(span, file$9, 145, 3, 2665);
    			add_location(br1, file$9, 151, 3, 2975);
    			add_location(br2, file$9, 151, 7, 2979);
    			attr_dev(div0, "class", "col-sm-12");
    			add_location(div0, file$9, 141, 2, 2542);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$9, 140, 1, 2522);
    			add_location(div2, file$9, 139, 0, 2515);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t2);
    			append_dev(div0, hr);
    			append_dev(div0, br0);
    			append_dev(div0, t3);
    			mount_component(button, div0, null);
    			append_dev(div0, t4);
    			append_dev(div0, span);
    			mount_component(buttongroup, span, null);
    			append_dev(div0, t5);
    			append_dev(div0, br1);
    			append_dev(div0, br2);
    			append_dev(div0, t6);
    			mount_component(table, div0, null);
    			append_dev(div2, t7);
    			mount_component(modal0, div2, null);
    			append_dev(div2, t8);
    			mount_component(modal1, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    			const buttongroup_changes = {};

    			if (dirty & /*$$scope, postgresactive, mongoactive*/ 134217752) {
    				buttongroup_changes.$$scope = { dirty, ctx };
    			}

    			buttongroup.$set(buttongroup_changes);
    			const table_changes = {};

    			if (dirty & /*$$scope, books*/ 134217729) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    			const modal0_changes = {};
    			if (dirty & /*addopen*/ 32) modal0_changes.isOpen = /*addopen*/ ctx[5];

    			if (dirty & /*$$scope, addBookForm*/ 134217730) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};
    			if (dirty & /*updateopen*/ 64) modal1_changes.isOpen = /*updateopen*/ ctx[6];

    			if (dirty & /*$$scope, editForm*/ 134217732) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			transition_in(buttongroup.$$.fragment, local);
    			transition_in(table.$$.fragment, local);
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(buttongroup.$$.fragment, local);
    			transition_out(table.$$.fragment, local);
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			destroy_component(button);
    			destroy_component(buttongroup);
    			destroy_component(table);
    			destroy_component(modal0);
    			destroy_component(modal1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	var books = [];
    	var addBookForm = { title: "", author: "", description: "" };

    	var editForm = {
    		_id: "",
    		title: "",
    		author: "",
    		description: ""
    	};

    	let mongoactive = false;
    	let postgresactive = true;
    	let currentdb = "postgres";

    	function setMongo() {
    		$$invalidate(0, books = []);
    		$$invalidate(3, mongoactive = true);
    		$$invalidate(4, postgresactive = false);
    		currentdb = "mongo";
    		getBooks();
    	}

    	function setPostgres() {
    		$$invalidate(0, books = []);
    		$$invalidate(3, mongoactive = false);
    		$$invalidate(4, postgresactive = true);
    		currentdb = "postgres";
    		getBooks();
    	}

    	function getBooks() {
    		axios$1.get(`http://localhost:3000/books/${currentdb}`).then(res => {
    			$$invalidate(0, books = res.data);
    		});
    	}

    	function removeBook(bookID) {
    		const path = `/books/${currentdb}/${bookID.book._id}`;

    		axios$1.delete(path).then(() => {
    			getBooks();
    		}).catch(error => {
    			console.error(error);
    			getBooks();
    		});
    	}

    	function initForm() {
    		$$invalidate(1, addBookForm.title = "", addBookForm);
    		$$invalidate(1, addBookForm.author = "", addBookForm);
    		$$invalidate(1, addBookForm.description = "", addBookForm);
    		$$invalidate(2, editForm._id = "", editForm);
    		$$invalidate(2, editForm.title = "", editForm);
    		$$invalidate(2, editForm.author = "", editForm);
    		$$invalidate(2, editForm.description = "", editForm);
    	}

    	function addBook() {
    		const payload = {
    			title: addBookForm.title,
    			author: addBookForm.author,
    			description: addBookForm.description
    		};

    		const path = `http://localhost:3000/books/${currentdb}`;

    		axios$1.post(path, payload).then(() => {
    			getBooks();
    		}).catch(error => {
    			console.log(error);
    			getBooks();
    		});

    		addtoggle();
    	}

    	function editBook(book) {
    		updatetoggle();
    		$$invalidate(2, editForm = book.book);
    	}

    	function updateBook() {
    		const payload = {
    			title: editForm.title,
    			author: editForm.author,
    			description: editForm.description
    		};

    		const path = `http://localhost:3000/books/books/${currentdb}/${editForm._id}`;

    		axios$1.put(path, payload).then(() => {
    			getBooks();
    		}).catch(error => {
    			console.error(error);
    			getBooks();
    		});

    		updatetoggle();
    	}

    	onMount(getBooks);
    	let addopen = false;

    	function addtoggle() {
    		initForm();
    		$$invalidate(5, addopen = !addopen);
    	}

    	
    	let updateopen = false;

    	function updatetoggle() {
    		initForm();
    		$$invalidate(6, updateopen = !updateopen);
    	}

    	

    	function input0_value_binding(value) {
    		addBookForm.title = value;
    		$$invalidate(1, addBookForm);
    	}

    	function input1_value_binding(value_1) {
    		addBookForm.author = value_1;
    		$$invalidate(1, addBookForm);
    	}

    	function input2_value_binding(value_2) {
    		addBookForm.description = value_2;
    		$$invalidate(1, addBookForm);
    	}

    	function input0_value_binding_1(value) {
    		editForm.title = value;
    		$$invalidate(2, editForm);
    	}

    	function input1_value_binding_1(value_1) {
    		editForm.author = value_1;
    		$$invalidate(2, editForm);
    	}

    	function input2_value_binding_1(value_2) {
    		editForm.description = value_2;
    		$$invalidate(2, editForm);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("books" in $$props) $$invalidate(0, books = $$props.books);
    		if ("addBookForm" in $$props) $$invalidate(1, addBookForm = $$props.addBookForm);
    		if ("editForm" in $$props) $$invalidate(2, editForm = $$props.editForm);
    		if ("mongoactive" in $$props) $$invalidate(3, mongoactive = $$props.mongoactive);
    		if ("postgresactive" in $$props) $$invalidate(4, postgresactive = $$props.postgresactive);
    		if ("currentdb" in $$props) currentdb = $$props.currentdb;
    		if ("addopen" in $$props) $$invalidate(5, addopen = $$props.addopen);
    		if ("updateopen" in $$props) $$invalidate(6, updateopen = $$props.updateopen);
    	};

    	return [
    		books,
    		addBookForm,
    		editForm,
    		mongoactive,
    		postgresactive,
    		addopen,
    		updateopen,
    		setMongo,
    		setPostgres,
    		removeBook,
    		addBook,
    		editBook,
    		updateBook,
    		addtoggle,
    		updatetoggle,
    		currentdb,
    		getBooks,
    		initForm,
    		input0_value_binding,
    		input1_value_binding,
    		input2_value_binding,
    		input0_value_binding_1,
    		input1_value_binding_1,
    		input2_value_binding_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
