import { type CodegenTypes, type HostComponent, type ViewProps } from "react-native";
type NativeScheme = "xyz" | "tms";
export interface NativeProps extends ViewProps {
    id: string;
    url?: string;
    tiles?: string[];
    minzoom?: CodegenTypes.WithDefault<CodegenTypes.Int32, -1>;
    maxzoom?: CodegenTypes.WithDefault<CodegenTypes.Int32, -1>;
    scheme?: CodegenTypes.WithDefault<NativeScheme, "xyz">;
    attribution?: string;
    tileSize?: CodegenTypes.WithDefault<CodegenTypes.Int32, 512>;
}
declare const _default: HostComponent<NativeProps>;
export default _default;
//# sourceMappingURL=RasterSourceNativeComponent.d.ts.map