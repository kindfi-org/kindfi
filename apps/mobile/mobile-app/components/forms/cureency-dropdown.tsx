import type { FC } from "react";
import { Box } from "../ui/box";
import { Text } from "../ui/text";
import {
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectItem
} from "../ui/select";
import type { StyleAttribute } from "react-native-css-interop/dist/types";
import { ChevronDownIcon } from "lucide-react-native";

function generateLighterColor(hex: string): string {
    const normalized = hex.toLowerCase();
    if (normalized === "#5970a6") {
        return "#F4F6FB";
    }

    const cleanHex = normalized.replace("#", "");

    if (cleanHex.length !== 6) return "#f0f0f0";

    const r = Number.parseInt(cleanHex.slice(0, 2), 16);
    const g = Number.parseInt(cleanHex.slice(2, 4), 16);
    const b = Number.parseInt(cleanHex.slice(4, 6), 16);

    const lighten = (channel: number) => Math.round(channel + (255 - channel) * 0.85);

    return `rgb(${lighten(r)}, ${lighten(g)}, ${lighten(b)})`;
}

interface CurrencyDropdownProps {
    value?: string;
    onChange?: (value: string) => void;
    label?: string;
    error?: boolean;
    errorMessage?: string;
    infoText?: string;
    className?: StyleAttribute;
    currencies?: string[];
    borderColor?: string;
}

const defaultCurrencies = ["USD", "NGN", "EUR", "GBP", "JPY"];

const CurrencyDropdown: FC<CurrencyDropdownProps> = ({
    value,
    onChange,
    label,
    error,
    errorMessage,
    infoText,
    className,
    currencies = defaultCurrencies,
    borderColor = "#5970A6"
}) => {
    const lightBg = generateLighterColor(borderColor);

    return (
        <Box className={`${className} w-full`}>
            {label && (
                <Text className="text-sm font-normal text-black text-left mb-2">
                    {label}
                </Text>
            )}

            <Select selectedValue={value} onValueChange={onChange}>
                <SelectTrigger
                    variant="outline"
                    size="md"
                    style={{
                        height: 40
                    }}
                    className={`border-[${borderColor}] bg-[${lightBg}] border rounded-xl px-4 py-3 `}
                >
                    <Box className=" flex-1 h-full" >
                        <Text className={"text-black"} >{value || "Select currency"}</Text>
                    </Box>
                    <SelectIcon className="mr-3" as={ChevronDownIcon} />
                </SelectTrigger>

                <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent className={'bg-white'} >
                        <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>

                        {currencies.map((currency) => (
                            <SelectItem textStyle={{
                                className: "text-black"
                            }} key={currency} label={currency} value={currency} />
                        ))}
                    </SelectContent>
                </SelectPortal>
            </Select>

            {error && (
                <Box className="w-full mt-2">
                    <Text style={{ color: "red" }} className="font-normal text-left text-xs">
                        {errorMessage}
                    </Text>
                </Box>
            )}

            {infoText && (
                <Box className="w-full mt-4">
                    <Text className="font-normal text-left text-xs text-black">
                        {infoText}
                    </Text>
                </Box>
            )}
        </Box>
    );
};

export default CurrencyDropdown;
