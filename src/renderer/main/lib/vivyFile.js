/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const VivyFile = $root.VivyFile = (() => {

    /**
     * Properties of a VivyFile.
     * @exports IVivyFile
     * @interface IVivyFile
     * @property {string|null} [prompt] VivyFile prompt
     * @property {string|null} [negativePrompt] VivyFile negativePrompt
     * @property {string|null} [genOptions] VivyFile genOptions
     * @property {IImage|null} [initImage] VivyFile initImage
     * @property {string|null} [initImageMask] VivyFile initImageMask
     * @property {Array.<IImage>|null} [images] VivyFile images
     * @property {number|null} [selectedImage] VivyFile selectedImage
     * @property {Array.<string>|null} [controlNetUnits] VivyFile controlNetUnits
     */

    /**
     * Constructs a new VivyFile.
     * @exports VivyFile
     * @classdesc Represents a VivyFile.
     * @implements IVivyFile
     * @constructor
     * @param {IVivyFile=} [properties] Properties to set
     */
    function VivyFile(properties) {
        this.images = [];
        this.controlNetUnits = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * VivyFile prompt.
     * @member {string} prompt
     * @memberof VivyFile
     * @instance
     */
    VivyFile.prototype.prompt = "";

    /**
     * VivyFile negativePrompt.
     * @member {string} negativePrompt
     * @memberof VivyFile
     * @instance
     */
    VivyFile.prototype.negativePrompt = "";

    /**
     * VivyFile genOptions.
     * @member {string} genOptions
     * @memberof VivyFile
     * @instance
     */
    VivyFile.prototype.genOptions = "";

    /**
     * VivyFile initImage.
     * @member {IImage|null|undefined} initImage
     * @memberof VivyFile
     * @instance
     */
    VivyFile.prototype.initImage = null;

    /**
     * VivyFile initImageMask.
     * @member {string|null|undefined} initImageMask
     * @memberof VivyFile
     * @instance
     */
    VivyFile.prototype.initImageMask = null;

    /**
     * VivyFile images.
     * @member {Array.<IImage>} images
     * @memberof VivyFile
     * @instance
     */
    VivyFile.prototype.images = $util.emptyArray;

    /**
     * VivyFile selectedImage.
     * @member {number} selectedImage
     * @memberof VivyFile
     * @instance
     */
    VivyFile.prototype.selectedImage = 0;

    /**
     * VivyFile controlNetUnits.
     * @member {Array.<string>} controlNetUnits
     * @memberof VivyFile
     * @instance
     */
    VivyFile.prototype.controlNetUnits = $util.emptyArray;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * VivyFile _initImage.
     * @member {"initImage"|undefined} _initImage
     * @memberof VivyFile
     * @instance
     */
    Object.defineProperty(VivyFile.prototype, "_initImage", {
        get: $util.oneOfGetter($oneOfFields = ["initImage"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * VivyFile _initImageMask.
     * @member {"initImageMask"|undefined} _initImageMask
     * @memberof VivyFile
     * @instance
     */
    Object.defineProperty(VivyFile.prototype, "_initImageMask", {
        get: $util.oneOfGetter($oneOfFields = ["initImageMask"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new VivyFile instance using the specified properties.
     * @function create
     * @memberof VivyFile
     * @static
     * @param {IVivyFile=} [properties] Properties to set
     * @returns {VivyFile} VivyFile instance
     */
    VivyFile.create = function create(properties) {
        return new VivyFile(properties);
    };

    /**
     * Encodes the specified VivyFile message. Does not implicitly {@link VivyFile.verify|verify} messages.
     * @function encode
     * @memberof VivyFile
     * @static
     * @param {IVivyFile} message VivyFile message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    VivyFile.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.prompt != null && Object.hasOwnProperty.call(message, "prompt"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.prompt);
        if (message.negativePrompt != null && Object.hasOwnProperty.call(message, "negativePrompt"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.negativePrompt);
        if (message.genOptions != null && Object.hasOwnProperty.call(message, "genOptions"))
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.genOptions);
        if (message.initImage != null && Object.hasOwnProperty.call(message, "initImage"))
            $root.Image.encode(message.initImage, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.initImageMask != null && Object.hasOwnProperty.call(message, "initImageMask"))
            writer.uint32(/* id 5, wireType 2 =*/42).string(message.initImageMask);
        if (message.images != null && message.images.length)
            for (let i = 0; i < message.images.length; ++i)
                $root.Image.encode(message.images[i], writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
        if (message.selectedImage != null && Object.hasOwnProperty.call(message, "selectedImage"))
            writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.selectedImage);
        if (message.controlNetUnits != null && message.controlNetUnits.length)
            for (let i = 0; i < message.controlNetUnits.length; ++i)
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.controlNetUnits[i]);
        return writer;
    };

    /**
     * Encodes the specified VivyFile message, length delimited. Does not implicitly {@link VivyFile.verify|verify} messages.
     * @function encodeDelimited
     * @memberof VivyFile
     * @static
     * @param {IVivyFile} message VivyFile message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    VivyFile.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a VivyFile message from the specified reader or buffer.
     * @function decode
     * @memberof VivyFile
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {VivyFile} VivyFile
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    VivyFile.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.VivyFile();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.prompt = reader.string();
                    break;
                }
            case 2: {
                    message.negativePrompt = reader.string();
                    break;
                }
            case 3: {
                    message.genOptions = reader.string();
                    break;
                }
            case 4: {
                    message.initImage = $root.Image.decode(reader, reader.uint32());
                    break;
                }
            case 5: {
                    message.initImageMask = reader.string();
                    break;
                }
            case 6: {
                    if (!(message.images && message.images.length))
                        message.images = [];
                    message.images.push($root.Image.decode(reader, reader.uint32()));
                    break;
                }
            case 7: {
                    message.selectedImage = reader.uint32();
                    break;
                }
            case 8: {
                    if (!(message.controlNetUnits && message.controlNetUnits.length))
                        message.controlNetUnits = [];
                    message.controlNetUnits.push(reader.string());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a VivyFile message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof VivyFile
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {VivyFile} VivyFile
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    VivyFile.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a VivyFile message.
     * @function verify
     * @memberof VivyFile
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    VivyFile.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        let properties = {};
        if (message.prompt != null && message.hasOwnProperty("prompt"))
            if (!$util.isString(message.prompt))
                return "prompt: string expected";
        if (message.negativePrompt != null && message.hasOwnProperty("negativePrompt"))
            if (!$util.isString(message.negativePrompt))
                return "negativePrompt: string expected";
        if (message.genOptions != null && message.hasOwnProperty("genOptions"))
            if (!$util.isString(message.genOptions))
                return "genOptions: string expected";
        if (message.initImage != null && message.hasOwnProperty("initImage")) {
            properties._initImage = 1;
            {
                let error = $root.Image.verify(message.initImage);
                if (error)
                    return "initImage." + error;
            }
        }
        if (message.initImageMask != null && message.hasOwnProperty("initImageMask")) {
            properties._initImageMask = 1;
            if (!$util.isString(message.initImageMask))
                return "initImageMask: string expected";
        }
        if (message.images != null && message.hasOwnProperty("images")) {
            if (!Array.isArray(message.images))
                return "images: array expected";
            for (let i = 0; i < message.images.length; ++i) {
                let error = $root.Image.verify(message.images[i]);
                if (error)
                    return "images." + error;
            }
        }
        if (message.selectedImage != null && message.hasOwnProperty("selectedImage"))
            if (!$util.isInteger(message.selectedImage))
                return "selectedImage: integer expected";
        if (message.controlNetUnits != null && message.hasOwnProperty("controlNetUnits")) {
            if (!Array.isArray(message.controlNetUnits))
                return "controlNetUnits: array expected";
            for (let i = 0; i < message.controlNetUnits.length; ++i)
                if (!$util.isString(message.controlNetUnits[i]))
                    return "controlNetUnits: string[] expected";
        }
        return null;
    };

    /**
     * Creates a VivyFile message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof VivyFile
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {VivyFile} VivyFile
     */
    VivyFile.fromObject = function fromObject(object) {
        if (object instanceof $root.VivyFile)
            return object;
        let message = new $root.VivyFile();
        if (object.prompt != null)
            message.prompt = String(object.prompt);
        if (object.negativePrompt != null)
            message.negativePrompt = String(object.negativePrompt);
        if (object.genOptions != null)
            message.genOptions = String(object.genOptions);
        if (object.initImage != null) {
            if (typeof object.initImage !== "object")
                throw TypeError(".VivyFile.initImage: object expected");
            message.initImage = $root.Image.fromObject(object.initImage);
        }
        if (object.initImageMask != null)
            message.initImageMask = String(object.initImageMask);
        if (object.images) {
            if (!Array.isArray(object.images))
                throw TypeError(".VivyFile.images: array expected");
            message.images = [];
            for (let i = 0; i < object.images.length; ++i) {
                if (typeof object.images[i] !== "object")
                    throw TypeError(".VivyFile.images: object expected");
                message.images[i] = $root.Image.fromObject(object.images[i]);
            }
        }
        if (object.selectedImage != null)
            message.selectedImage = object.selectedImage >>> 0;
        if (object.controlNetUnits) {
            if (!Array.isArray(object.controlNetUnits))
                throw TypeError(".VivyFile.controlNetUnits: array expected");
            message.controlNetUnits = [];
            for (let i = 0; i < object.controlNetUnits.length; ++i)
                message.controlNetUnits[i] = String(object.controlNetUnits[i]);
        }
        return message;
    };

    /**
     * Creates a plain object from a VivyFile message. Also converts values to other types if specified.
     * @function toObject
     * @memberof VivyFile
     * @static
     * @param {VivyFile} message VivyFile
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    VivyFile.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.arrays || options.defaults) {
            object.images = [];
            object.controlNetUnits = [];
        }
        if (options.defaults) {
            object.prompt = "";
            object.negativePrompt = "";
            object.genOptions = "";
            object.selectedImage = 0;
        }
        if (message.prompt != null && message.hasOwnProperty("prompt"))
            object.prompt = message.prompt;
        if (message.negativePrompt != null && message.hasOwnProperty("negativePrompt"))
            object.negativePrompt = message.negativePrompt;
        if (message.genOptions != null && message.hasOwnProperty("genOptions"))
            object.genOptions = message.genOptions;
        if (message.initImage != null && message.hasOwnProperty("initImage")) {
            object.initImage = $root.Image.toObject(message.initImage, options);
            if (options.oneofs)
                object._initImage = "initImage";
        }
        if (message.initImageMask != null && message.hasOwnProperty("initImageMask")) {
            object.initImageMask = message.initImageMask;
            if (options.oneofs)
                object._initImageMask = "initImageMask";
        }
        if (message.images && message.images.length) {
            object.images = [];
            for (let j = 0; j < message.images.length; ++j)
                object.images[j] = $root.Image.toObject(message.images[j], options);
        }
        if (message.selectedImage != null && message.hasOwnProperty("selectedImage"))
            object.selectedImage = message.selectedImage;
        if (message.controlNetUnits && message.controlNetUnits.length) {
            object.controlNetUnits = [];
            for (let j = 0; j < message.controlNetUnits.length; ++j)
                object.controlNetUnits[j] = message.controlNetUnits[j];
        }
        return object;
    };

    /**
     * Converts this VivyFile to JSON.
     * @function toJSON
     * @memberof VivyFile
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    VivyFile.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for VivyFile
     * @function getTypeUrl
     * @memberof VivyFile
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    VivyFile.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/VivyFile";
    };

    return VivyFile;
})();

export const Image = $root.Image = (() => {

    /**
     * Properties of an Image.
     * @exports IImage
     * @interface IImage
     * @property {string|null} [id] Image id
     * @property {string|null} [data] Image data
     * @property {IImageInfo|null} [info] Image info
     */

    /**
     * Constructs a new Image.
     * @exports Image
     * @classdesc Represents an Image.
     * @implements IImage
     * @constructor
     * @param {IImage=} [properties] Properties to set
     */
    function Image(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Image id.
     * @member {string} id
     * @memberof Image
     * @instance
     */
    Image.prototype.id = "";

    /**
     * Image data.
     * @member {string} data
     * @memberof Image
     * @instance
     */
    Image.prototype.data = "";

    /**
     * Image info.
     * @member {IImageInfo|null|undefined} info
     * @memberof Image
     * @instance
     */
    Image.prototype.info = null;

    /**
     * Creates a new Image instance using the specified properties.
     * @function create
     * @memberof Image
     * @static
     * @param {IImage=} [properties] Properties to set
     * @returns {Image} Image instance
     */
    Image.create = function create(properties) {
        return new Image(properties);
    };

    /**
     * Encodes the specified Image message. Does not implicitly {@link Image.verify|verify} messages.
     * @function encode
     * @memberof Image
     * @static
     * @param {IImage} message Image message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Image.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.id != null && Object.hasOwnProperty.call(message, "id"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
        if (message.data != null && Object.hasOwnProperty.call(message, "data"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.data);
        if (message.info != null && Object.hasOwnProperty.call(message, "info"))
            $root.ImageInfo.encode(message.info, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Image message, length delimited. Does not implicitly {@link Image.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Image
     * @static
     * @param {IImage} message Image message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Image.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an Image message from the specified reader or buffer.
     * @function decode
     * @memberof Image
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Image} Image
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Image.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Image();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.id = reader.string();
                    break;
                }
            case 2: {
                    message.data = reader.string();
                    break;
                }
            case 3: {
                    message.info = $root.ImageInfo.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an Image message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Image
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Image} Image
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Image.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an Image message.
     * @function verify
     * @memberof Image
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Image.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.id != null && message.hasOwnProperty("id"))
            if (!$util.isString(message.id))
                return "id: string expected";
        if (message.data != null && message.hasOwnProperty("data"))
            if (!$util.isString(message.data))
                return "data: string expected";
        if (message.info != null && message.hasOwnProperty("info")) {
            let error = $root.ImageInfo.verify(message.info);
            if (error)
                return "info." + error;
        }
        return null;
    };

    /**
     * Creates an Image message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Image
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Image} Image
     */
    Image.fromObject = function fromObject(object) {
        if (object instanceof $root.Image)
            return object;
        let message = new $root.Image();
        if (object.id != null)
            message.id = String(object.id);
        if (object.data != null)
            message.data = String(object.data);
        if (object.info != null) {
            if (typeof object.info !== "object")
                throw TypeError(".Image.info: object expected");
            message.info = $root.ImageInfo.fromObject(object.info);
        }
        return message;
    };

    /**
     * Creates a plain object from an Image message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Image
     * @static
     * @param {Image} message Image
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Image.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.id = "";
            object.data = "";
            object.info = null;
        }
        if (message.id != null && message.hasOwnProperty("id"))
            object.id = message.id;
        if (message.data != null && message.hasOwnProperty("data"))
            object.data = message.data;
        if (message.info != null && message.hasOwnProperty("info"))
            object.info = $root.ImageInfo.toObject(message.info, options);
        return object;
    };

    /**
     * Converts this Image to JSON.
     * @function toJSON
     * @memberof Image
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Image.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Image
     * @function getTypeUrl
     * @memberof Image
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Image.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Image";
    };

    return Image;
})();

export const ImageInfo = $root.ImageInfo = (() => {

    /**
     * Properties of an ImageInfo.
     * @exports IImageInfo
     * @interface IImageInfo
     * @property {string|null} [mime] ImageInfo mime
     * @property {number|null} [width] ImageInfo width
     * @property {number|null} [height] ImageInfo height
     * @property {number|null} [size] ImageInfo size
     * @property {string|null} [prompt] ImageInfo prompt
     * @property {string|null} [negativePrompt] ImageInfo negativePrompt
     * @property {number|null} [steps] ImageInfo steps
     * @property {string|null} [sampler] ImageInfo sampler
     * @property {number|null} [cfgScale] ImageInfo cfgScale
     * @property {number|null} [seed] ImageInfo seed
     * @property {number|null} [clipSkip] ImageInfo clipSkip
     * @property {string|null} [scheduler] ImageInfo scheduler
     */

    /**
     * Constructs a new ImageInfo.
     * @exports ImageInfo
     * @classdesc Represents an ImageInfo.
     * @implements IImageInfo
     * @constructor
     * @param {IImageInfo=} [properties] Properties to set
     */
    function ImageInfo(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ImageInfo mime.
     * @member {string} mime
     * @memberof ImageInfo
     * @instance
     */
    ImageInfo.prototype.mime = "";

    /**
     * ImageInfo width.
     * @member {number} width
     * @memberof ImageInfo
     * @instance
     */
    ImageInfo.prototype.width = 0;

    /**
     * ImageInfo height.
     * @member {number} height
     * @memberof ImageInfo
     * @instance
     */
    ImageInfo.prototype.height = 0;

    /**
     * ImageInfo size.
     * @member {number} size
     * @memberof ImageInfo
     * @instance
     */
    ImageInfo.prototype.size = 0;

    /**
     * ImageInfo prompt.
     * @member {string|null|undefined} prompt
     * @memberof ImageInfo
     * @instance
     */
    ImageInfo.prototype.prompt = null;

    /**
     * ImageInfo negativePrompt.
     * @member {string|null|undefined} negativePrompt
     * @memberof ImageInfo
     * @instance
     */
    ImageInfo.prototype.negativePrompt = null;

    /**
     * ImageInfo steps.
     * @member {number|null|undefined} steps
     * @memberof ImageInfo
     * @instance
     */
    ImageInfo.prototype.steps = null;

    /**
     * ImageInfo sampler.
     * @member {string|null|undefined} sampler
     * @memberof ImageInfo
     * @instance
     */
    ImageInfo.prototype.sampler = null;

    /**
     * ImageInfo cfgScale.
     * @member {number|null|undefined} cfgScale
     * @memberof ImageInfo
     * @instance
     */
    ImageInfo.prototype.cfgScale = null;

    /**
     * ImageInfo seed.
     * @member {number|null|undefined} seed
     * @memberof ImageInfo
     * @instance
     */
    ImageInfo.prototype.seed = null;

    /**
     * ImageInfo clipSkip.
     * @member {number|null|undefined} clipSkip
     * @memberof ImageInfo
     * @instance
     */
    ImageInfo.prototype.clipSkip = null;

    /**
     * ImageInfo scheduler.
     * @member {string|null|undefined} scheduler
     * @memberof ImageInfo
     * @instance
     */
    ImageInfo.prototype.scheduler = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * ImageInfo _prompt.
     * @member {"prompt"|undefined} _prompt
     * @memberof ImageInfo
     * @instance
     */
    Object.defineProperty(ImageInfo.prototype, "_prompt", {
        get: $util.oneOfGetter($oneOfFields = ["prompt"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * ImageInfo _negativePrompt.
     * @member {"negativePrompt"|undefined} _negativePrompt
     * @memberof ImageInfo
     * @instance
     */
    Object.defineProperty(ImageInfo.prototype, "_negativePrompt", {
        get: $util.oneOfGetter($oneOfFields = ["negativePrompt"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * ImageInfo _steps.
     * @member {"steps"|undefined} _steps
     * @memberof ImageInfo
     * @instance
     */
    Object.defineProperty(ImageInfo.prototype, "_steps", {
        get: $util.oneOfGetter($oneOfFields = ["steps"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * ImageInfo _sampler.
     * @member {"sampler"|undefined} _sampler
     * @memberof ImageInfo
     * @instance
     */
    Object.defineProperty(ImageInfo.prototype, "_sampler", {
        get: $util.oneOfGetter($oneOfFields = ["sampler"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * ImageInfo _cfgScale.
     * @member {"cfgScale"|undefined} _cfgScale
     * @memberof ImageInfo
     * @instance
     */
    Object.defineProperty(ImageInfo.prototype, "_cfgScale", {
        get: $util.oneOfGetter($oneOfFields = ["cfgScale"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * ImageInfo _seed.
     * @member {"seed"|undefined} _seed
     * @memberof ImageInfo
     * @instance
     */
    Object.defineProperty(ImageInfo.prototype, "_seed", {
        get: $util.oneOfGetter($oneOfFields = ["seed"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * ImageInfo _clipSkip.
     * @member {"clipSkip"|undefined} _clipSkip
     * @memberof ImageInfo
     * @instance
     */
    Object.defineProperty(ImageInfo.prototype, "_clipSkip", {
        get: $util.oneOfGetter($oneOfFields = ["clipSkip"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * ImageInfo _scheduler.
     * @member {"scheduler"|undefined} _scheduler
     * @memberof ImageInfo
     * @instance
     */
    Object.defineProperty(ImageInfo.prototype, "_scheduler", {
        get: $util.oneOfGetter($oneOfFields = ["scheduler"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new ImageInfo instance using the specified properties.
     * @function create
     * @memberof ImageInfo
     * @static
     * @param {IImageInfo=} [properties] Properties to set
     * @returns {ImageInfo} ImageInfo instance
     */
    ImageInfo.create = function create(properties) {
        return new ImageInfo(properties);
    };

    /**
     * Encodes the specified ImageInfo message. Does not implicitly {@link ImageInfo.verify|verify} messages.
     * @function encode
     * @memberof ImageInfo
     * @static
     * @param {IImageInfo} message ImageInfo message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ImageInfo.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.mime != null && Object.hasOwnProperty.call(message, "mime"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.mime);
        if (message.width != null && Object.hasOwnProperty.call(message, "width"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.width);
        if (message.height != null && Object.hasOwnProperty.call(message, "height"))
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.height);
        if (message.size != null && Object.hasOwnProperty.call(message, "size"))
            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.size);
        if (message.prompt != null && Object.hasOwnProperty.call(message, "prompt"))
            writer.uint32(/* id 5, wireType 2 =*/42).string(message.prompt);
        if (message.negativePrompt != null && Object.hasOwnProperty.call(message, "negativePrompt"))
            writer.uint32(/* id 6, wireType 2 =*/50).string(message.negativePrompt);
        if (message.steps != null && Object.hasOwnProperty.call(message, "steps"))
            writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.steps);
        if (message.sampler != null && Object.hasOwnProperty.call(message, "sampler"))
            writer.uint32(/* id 8, wireType 2 =*/66).string(message.sampler);
        if (message.cfgScale != null && Object.hasOwnProperty.call(message, "cfgScale"))
            writer.uint32(/* id 9, wireType 0 =*/72).uint32(message.cfgScale);
        if (message.seed != null && Object.hasOwnProperty.call(message, "seed"))
            writer.uint32(/* id 10, wireType 0 =*/80).uint32(message.seed);
        if (message.clipSkip != null && Object.hasOwnProperty.call(message, "clipSkip"))
            writer.uint32(/* id 11, wireType 0 =*/88).uint32(message.clipSkip);
        if (message.scheduler != null && Object.hasOwnProperty.call(message, "scheduler"))
            writer.uint32(/* id 12, wireType 2 =*/98).string(message.scheduler);
        return writer;
    };

    /**
     * Encodes the specified ImageInfo message, length delimited. Does not implicitly {@link ImageInfo.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ImageInfo
     * @static
     * @param {IImageInfo} message ImageInfo message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ImageInfo.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an ImageInfo message from the specified reader or buffer.
     * @function decode
     * @memberof ImageInfo
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ImageInfo} ImageInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ImageInfo.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.ImageInfo();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.mime = reader.string();
                    break;
                }
            case 2: {
                    message.width = reader.uint32();
                    break;
                }
            case 3: {
                    message.height = reader.uint32();
                    break;
                }
            case 4: {
                    message.size = reader.uint32();
                    break;
                }
            case 5: {
                    message.prompt = reader.string();
                    break;
                }
            case 6: {
                    message.negativePrompt = reader.string();
                    break;
                }
            case 7: {
                    message.steps = reader.uint32();
                    break;
                }
            case 8: {
                    message.sampler = reader.string();
                    break;
                }
            case 9: {
                    message.cfgScale = reader.uint32();
                    break;
                }
            case 10: {
                    message.seed = reader.uint32();
                    break;
                }
            case 11: {
                    message.clipSkip = reader.uint32();
                    break;
                }
            case 12: {
                    message.scheduler = reader.string();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an ImageInfo message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ImageInfo
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ImageInfo} ImageInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ImageInfo.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an ImageInfo message.
     * @function verify
     * @memberof ImageInfo
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ImageInfo.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        let properties = {};
        if (message.mime != null && message.hasOwnProperty("mime"))
            if (!$util.isString(message.mime))
                return "mime: string expected";
        if (message.width != null && message.hasOwnProperty("width"))
            if (!$util.isInteger(message.width))
                return "width: integer expected";
        if (message.height != null && message.hasOwnProperty("height"))
            if (!$util.isInteger(message.height))
                return "height: integer expected";
        if (message.size != null && message.hasOwnProperty("size"))
            if (!$util.isInteger(message.size))
                return "size: integer expected";
        if (message.prompt != null && message.hasOwnProperty("prompt")) {
            properties._prompt = 1;
            if (!$util.isString(message.prompt))
                return "prompt: string expected";
        }
        if (message.negativePrompt != null && message.hasOwnProperty("negativePrompt")) {
            properties._negativePrompt = 1;
            if (!$util.isString(message.negativePrompt))
                return "negativePrompt: string expected";
        }
        if (message.steps != null && message.hasOwnProperty("steps")) {
            properties._steps = 1;
            if (!$util.isInteger(message.steps))
                return "steps: integer expected";
        }
        if (message.sampler != null && message.hasOwnProperty("sampler")) {
            properties._sampler = 1;
            if (!$util.isString(message.sampler))
                return "sampler: string expected";
        }
        if (message.cfgScale != null && message.hasOwnProperty("cfgScale")) {
            properties._cfgScale = 1;
            if (!$util.isInteger(message.cfgScale))
                return "cfgScale: integer expected";
        }
        if (message.seed != null && message.hasOwnProperty("seed")) {
            properties._seed = 1;
            if (!$util.isInteger(message.seed))
                return "seed: integer expected";
        }
        if (message.clipSkip != null && message.hasOwnProperty("clipSkip")) {
            properties._clipSkip = 1;
            if (!$util.isInteger(message.clipSkip))
                return "clipSkip: integer expected";
        }
        if (message.scheduler != null && message.hasOwnProperty("scheduler")) {
            properties._scheduler = 1;
            if (!$util.isString(message.scheduler))
                return "scheduler: string expected";
        }
        return null;
    };

    /**
     * Creates an ImageInfo message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ImageInfo
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ImageInfo} ImageInfo
     */
    ImageInfo.fromObject = function fromObject(object) {
        if (object instanceof $root.ImageInfo)
            return object;
        let message = new $root.ImageInfo();
        if (object.mime != null)
            message.mime = String(object.mime);
        if (object.width != null)
            message.width = object.width >>> 0;
        if (object.height != null)
            message.height = object.height >>> 0;
        if (object.size != null)
            message.size = object.size >>> 0;
        if (object.prompt != null)
            message.prompt = String(object.prompt);
        if (object.negativePrompt != null)
            message.negativePrompt = String(object.negativePrompt);
        if (object.steps != null)
            message.steps = object.steps >>> 0;
        if (object.sampler != null)
            message.sampler = String(object.sampler);
        if (object.cfgScale != null)
            message.cfgScale = object.cfgScale >>> 0;
        if (object.seed != null)
            message.seed = object.seed >>> 0;
        if (object.clipSkip != null)
            message.clipSkip = object.clipSkip >>> 0;
        if (object.scheduler != null)
            message.scheduler = String(object.scheduler);
        return message;
    };

    /**
     * Creates a plain object from an ImageInfo message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ImageInfo
     * @static
     * @param {ImageInfo} message ImageInfo
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ImageInfo.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.mime = "";
            object.width = 0;
            object.height = 0;
            object.size = 0;
        }
        if (message.mime != null && message.hasOwnProperty("mime"))
            object.mime = message.mime;
        if (message.width != null && message.hasOwnProperty("width"))
            object.width = message.width;
        if (message.height != null && message.hasOwnProperty("height"))
            object.height = message.height;
        if (message.size != null && message.hasOwnProperty("size"))
            object.size = message.size;
        if (message.prompt != null && message.hasOwnProperty("prompt")) {
            object.prompt = message.prompt;
            if (options.oneofs)
                object._prompt = "prompt";
        }
        if (message.negativePrompt != null && message.hasOwnProperty("negativePrompt")) {
            object.negativePrompt = message.negativePrompt;
            if (options.oneofs)
                object._negativePrompt = "negativePrompt";
        }
        if (message.steps != null && message.hasOwnProperty("steps")) {
            object.steps = message.steps;
            if (options.oneofs)
                object._steps = "steps";
        }
        if (message.sampler != null && message.hasOwnProperty("sampler")) {
            object.sampler = message.sampler;
            if (options.oneofs)
                object._sampler = "sampler";
        }
        if (message.cfgScale != null && message.hasOwnProperty("cfgScale")) {
            object.cfgScale = message.cfgScale;
            if (options.oneofs)
                object._cfgScale = "cfgScale";
        }
        if (message.seed != null && message.hasOwnProperty("seed")) {
            object.seed = message.seed;
            if (options.oneofs)
                object._seed = "seed";
        }
        if (message.clipSkip != null && message.hasOwnProperty("clipSkip")) {
            object.clipSkip = message.clipSkip;
            if (options.oneofs)
                object._clipSkip = "clipSkip";
        }
        if (message.scheduler != null && message.hasOwnProperty("scheduler")) {
            object.scheduler = message.scheduler;
            if (options.oneofs)
                object._scheduler = "scheduler";
        }
        return object;
    };

    /**
     * Converts this ImageInfo to JSON.
     * @function toJSON
     * @memberof ImageInfo
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ImageInfo.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ImageInfo
     * @function getTypeUrl
     * @memberof ImageInfo
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ImageInfo.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/ImageInfo";
    };

    return ImageInfo;
})();

export { $root as default };
