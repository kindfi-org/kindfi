import CategorySelector from "@/components/forms/category-select";
import InputField from "@/components/forms/input-field";
import StepHeader from "@/components/forms/step-header";
import StepNavigation from "@/components/forms/step-navigation";
import { Box } from "@/components/ui/box";
import { ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MotiView } from "moti";
const Step1Schema = z.object({
	website: z.string().url("Please enter a valid URL"),
	location: z.string().min(1, "Location is required"),
	category: z.string().min(1, "Category is required"),
	description: z.string().min(10, "Description must be at least 10 characters"),
});
type Step1FormData = z.infer<typeof Step1Schema>;
const Step1Details = () => {
	const isiOS = Platform.OS === "ios";
	const paddingTop = isiOS
		? useSafeAreaInsets().top * 2
		: useSafeAreaInsets().top + 20;
	const router = useRouter();
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<Step1FormData>({
		resolver: zodResolver(Step1Schema),
		defaultValues: {
			website: "",
			location: "",
			category: "",
			description: "",
		},
	});

	const onSubmit = (data: Step1FormData) => {
		console.log("Form Data:", data);
		router.push("/submit-project/step-2-funding");
	};
	return (
		<>
			<ScrollView
				contentContainerStyle={{
					alignItems: "center",
					justifyContent: "flex-start",
					flexGrow: 1,
					paddingTop: paddingTop,
					backgroundColor: "#F4F6FB",
					paddingHorizontal: 24,
				}}
			>
				<StepHeader />

				<Box className="w-full bg-white  rounded-lg py-8 px-6 mt-10   ">
					<MotiView
						from={{ opacity: 0, translateY: 20 }}
						animate={{ opacity: 1, translateY: 0 }}
						transition={{ type: "timing", duration: 400 }}
					>
						<Controller
							control={control}
							name="website"
							render={({ field }) => (
								<InputField
									className="lowercase"
									label="What's your project’s website?"
									placeHolder="https://"
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									inputRef={field.ref}
									error={!!errors?.website}
									errorMessage={errors.website?.message}
								/>
							)}
						/>
					</MotiView>
					<MotiView
						from={{ opacity: 0, translateY: 20 }}
						animate={{ opacity: 1, translateY: 0 }}
						transition={{ type: "timing", duration: 400 }}
					>
						<Controller
							control={control}
							name="location"
							render={({ field }) => (
								<InputField
									className="mt-8"
									label="Where is your project based?"
									placeHolder="Enter location"
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									inputRef={field.ref}
									error={!!errors.location}
									errorMessage={errors.location?.message}
								/>
							)}
						/>
					</MotiView>


					<Controller
						control={control}
						name="category"
						render={({ field }) => (
							<CategorySelector
								error={!!errors.category}
								errorMessage={errors.category?.message}
								onValueChange={(category) => {
									console.log("category", category);
									field.onChange(category);
								}}
							/>
						)}
					/>

					<MotiView
						from={{ opacity: 0, translateY: 20 }}
						animate={{ opacity: 1, translateY: 0 }}
						transition={{ type: "timing", duration: 400 }}
					>
						<Controller
							control={control}
							name="description"
							render={({ field }) => (
								<InputField
									className=" mt-8"
									label="Describe your project in simple words"
									placeHolder="eg providing clean water for rural communities"
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									inputRef={field.ref}
									error={!!errors.description}
									errorMessage={errors.description?.message}
								/>
							)}
						/>
					</MotiView>

					<StepNavigation onhandleNext={handleSubmit(onSubmit)} />
				</Box>
			</ScrollView>
			<StatusBar backgroundColor="#F4F6FB" style="light" />
		</>
	);
};

export default Step1Details;
