import { usePathname } from "expo-router";
import { Box } from "../ui/box";
import { Center } from "../ui/center";
import { Divider } from "../ui/divider";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";
import { Heading } from "../ui/heading";

const StepHeader = () => {
    const steps = [
        {
            stepNo: 1,
            title: " Project Details",
            path: "step-1-details",
        },
        {
            stepNo: 2,
            title: " Funding Information ",
            path: "step-2-funding",
        },
        {
            stepNo: 3,
            title: " Additional Details",
            path: "step-3-summary",
        },
    ];
    const pathname = usePathname();
    return (
        <>
            <Center className="w-full justify-center flex  items-center">
                <Box className=" w-36 border h-12 py-2 rounded-full items-center justify-center">
                    <Text className=" font-medium text-black text-base">
                        Create Project
                    </Text>
                </Box>
            </Center>

            <Center className=" mt-10">
                <Heading className=" text-black font-bold text-4xl text-center">
                    Let’s get your KindFi project started
                </Heading>
                <Text className=" text-center text-black font-normal text-base mt-4">
                    Create a crowdfunding campaign and make an impact with the power of
                    Web3 transparency.
                </Text>
            </Center>

            <HStack className="w-full items-start justify-center mt-12">
                {steps.map(({ title, stepNo, path }, index) => {
                    const isActive = pathname.includes(path);
                    return (
                        <HStack
                            key={stepNo}
                            className=" items-center justify-center relative"
                        >
                            <VStack className="w-auto items-center justify-center">
                                <Center
                                    className={`${isActive ? "bg-black" : "bg-[#ECF0F8]"} rounded-full w-7 h-7 `}
                                >
                                    <Text
                                        className={`font-medium text-base ${isActive ? "text-white" : "text-[#000000B2]"} `}
                                    >
                                        {stepNo}
                                    </Text>

                                </Center>
                                <Text
                                    className={` mt-4 ${isActive ? "text-black font-semibold text-base" : "text-[#00000099] font-medium text-sm"}`}
                                >
                                    {title}
                                </Text>
                                {isActive && <Box style={{
                                    bottom: -10
                                }} className="w-full h-1 bg-black mt-2 absolute " />}
                            </VStack>
                            {index !== steps.length - 1 && (
                                <Box className="w-10 h-[1px] bg-gray-300 " />
                            )}

                        </HStack>
                    );
                })}
            </HStack>
        </>
    );
};

export default StepHeader;
