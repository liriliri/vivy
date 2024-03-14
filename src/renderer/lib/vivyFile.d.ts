import * as $protobuf from "protobufjs";
import Long = require("long");
/** Properties of a VivyFile. */
export interface IVivyFile {

    /** VivyFile prompt */
    prompt?: (string|null);

    /** VivyFile negativePrompt */
    negativePrompt?: (string|null);

    /** VivyFile genOptions */
    genOptions?: (string|null);

    /** VivyFile initImage */
    initImage?: (IImage|null);

    /** VivyFile initImageMask */
    initImageMask?: (string|null);

    /** VivyFile images */
    images?: (IImage[]|null);

    /** VivyFile selectedImage */
    selectedImage?: (number|null);
}

/** Represents a VivyFile. */
export class VivyFile implements IVivyFile {

    /**
     * Constructs a new VivyFile.
     * @param [properties] Properties to set
     */
    constructor(properties?: IVivyFile);

    /** VivyFile prompt. */
    public prompt: string;

    /** VivyFile negativePrompt. */
    public negativePrompt: string;

    /** VivyFile genOptions. */
    public genOptions: string;

    /** VivyFile initImage. */
    public initImage?: (IImage|null);

    /** VivyFile initImageMask. */
    public initImageMask?: (string|null);

    /** VivyFile images. */
    public images: IImage[];

    /** VivyFile selectedImage. */
    public selectedImage: number;

    /** VivyFile _initImage. */
    public _initImage?: "initImage";

    /** VivyFile _initImageMask. */
    public _initImageMask?: "initImageMask";

    /**
     * Creates a new VivyFile instance using the specified properties.
     * @param [properties] Properties to set
     * @returns VivyFile instance
     */
    public static create(properties?: IVivyFile): VivyFile;

    /**
     * Encodes the specified VivyFile message. Does not implicitly {@link VivyFile.verify|verify} messages.
     * @param message VivyFile message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IVivyFile, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified VivyFile message, length delimited. Does not implicitly {@link VivyFile.verify|verify} messages.
     * @param message VivyFile message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IVivyFile, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a VivyFile message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns VivyFile
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): VivyFile;

    /**
     * Decodes a VivyFile message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns VivyFile
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): VivyFile;

    /**
     * Verifies a VivyFile message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a VivyFile message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns VivyFile
     */
    public static fromObject(object: { [k: string]: any }): VivyFile;

    /**
     * Creates a plain object from a VivyFile message. Also converts values to other types if specified.
     * @param message VivyFile
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: VivyFile, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this VivyFile to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for VivyFile
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of an Image. */
export interface IImage {

    /** Image id */
    id?: (string|null);

    /** Image data */
    data?: (string|null);

    /** Image info */
    info?: (IImageInfo|null);
}

/** Represents an Image. */
export class Image implements IImage {

    /**
     * Constructs a new Image.
     * @param [properties] Properties to set
     */
    constructor(properties?: IImage);

    /** Image id. */
    public id: string;

    /** Image data. */
    public data: string;

    /** Image info. */
    public info?: (IImageInfo|null);

    /**
     * Creates a new Image instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Image instance
     */
    public static create(properties?: IImage): Image;

    /**
     * Encodes the specified Image message. Does not implicitly {@link Image.verify|verify} messages.
     * @param message Image message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IImage, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Image message, length delimited. Does not implicitly {@link Image.verify|verify} messages.
     * @param message Image message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IImage, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an Image message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Image
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Image;

    /**
     * Decodes an Image message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Image
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Image;

    /**
     * Verifies an Image message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an Image message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Image
     */
    public static fromObject(object: { [k: string]: any }): Image;

    /**
     * Creates a plain object from an Image message. Also converts values to other types if specified.
     * @param message Image
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Image, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Image to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Image
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of an ImageInfo. */
export interface IImageInfo {

    /** ImageInfo mime */
    mime?: (string|null);

    /** ImageInfo width */
    width?: (number|null);

    /** ImageInfo height */
    height?: (number|null);

    /** ImageInfo size */
    size?: (number|null);

    /** ImageInfo prompt */
    prompt?: (string|null);

    /** ImageInfo negativePrompt */
    negativePrompt?: (string|null);

    /** ImageInfo steps */
    steps?: (number|null);

    /** ImageInfo sampler */
    sampler?: (string|null);

    /** ImageInfo cfgScale */
    cfgScale?: (number|null);

    /** ImageInfo seed */
    seed?: (number|null);

    /** ImageInfo clipSkip */
    clipSkip?: (number|null);
}

/** Represents an ImageInfo. */
export class ImageInfo implements IImageInfo {

    /**
     * Constructs a new ImageInfo.
     * @param [properties] Properties to set
     */
    constructor(properties?: IImageInfo);

    /** ImageInfo mime. */
    public mime: string;

    /** ImageInfo width. */
    public width: number;

    /** ImageInfo height. */
    public height: number;

    /** ImageInfo size. */
    public size: number;

    /** ImageInfo prompt. */
    public prompt?: (string|null);

    /** ImageInfo negativePrompt. */
    public negativePrompt?: (string|null);

    /** ImageInfo steps. */
    public steps?: (number|null);

    /** ImageInfo sampler. */
    public sampler?: (string|null);

    /** ImageInfo cfgScale. */
    public cfgScale?: (number|null);

    /** ImageInfo seed. */
    public seed?: (number|null);

    /** ImageInfo clipSkip. */
    public clipSkip?: (number|null);

    /** ImageInfo _prompt. */
    public _prompt?: "prompt";

    /** ImageInfo _negativePrompt. */
    public _negativePrompt?: "negativePrompt";

    /** ImageInfo _steps. */
    public _steps?: "steps";

    /** ImageInfo _sampler. */
    public _sampler?: "sampler";

    /** ImageInfo _cfgScale. */
    public _cfgScale?: "cfgScale";

    /** ImageInfo _seed. */
    public _seed?: "seed";

    /** ImageInfo _clipSkip. */
    public _clipSkip?: "clipSkip";

    /**
     * Creates a new ImageInfo instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ImageInfo instance
     */
    public static create(properties?: IImageInfo): ImageInfo;

    /**
     * Encodes the specified ImageInfo message. Does not implicitly {@link ImageInfo.verify|verify} messages.
     * @param message ImageInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IImageInfo, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ImageInfo message, length delimited. Does not implicitly {@link ImageInfo.verify|verify} messages.
     * @param message ImageInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IImageInfo, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an ImageInfo message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ImageInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ImageInfo;

    /**
     * Decodes an ImageInfo message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ImageInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ImageInfo;

    /**
     * Verifies an ImageInfo message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an ImageInfo message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ImageInfo
     */
    public static fromObject(object: { [k: string]: any }): ImageInfo;

    /**
     * Creates a plain object from an ImageInfo message. Also converts values to other types if specified.
     * @param message ImageInfo
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ImageInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ImageInfo to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ImageInfo
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}
