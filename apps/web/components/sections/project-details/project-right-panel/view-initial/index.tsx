import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Heart } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/base/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  CSRFTokenField,
} from "~/components/base/form";
import { Input } from "~/components/base/input";
import { PrimaryCard } from "~/components/cards/primary-card";
import {
  dataCreator,
  dataDetails,
  dataFutureEquity,
  nftTiers,
} from "~/lib/mock-data/project/mock-project-side-panel";
import { GoalProgress, type GoalProgressProps } from "../goal-progress";
import { FutureEquity } from "./future-equity";
import { NftReward } from "./nft-reward";
import { ProjectCreator } from "./project-creator";
import { SimilarProject } from "./similar-project";

const FormSchema = z.object({
  amountOfSupport: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !Number.isNaN(Number(val)), "Must be a valid number"),
});

export type FormValue = z.infer<typeof FormSchema>;

type ViewInitialProps = {
  onSubmit: (data: FormValue) => void;
} & GoalProgressProps;

export function ViewInitial({
  amountOfSupport,
  goal,
  percentage,
  onSubmit,
}: ViewInitialProps) {
  const form = useForm<FormValue>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amountOfSupport: "",
    },
  });

  return (
    <div className="space-y-5">
      <PrimaryCard className="space-y-5">
        <GoalProgress
          amountOfSupport={amountOfSupport}
          goal={goal}
          percentage={percentage}
        />

        <div className="flex flex-wrap mt-6 gap-y-4">
          {dataDetails.map((item) => (
            <InfoDetails key={item.name} {...item} />
          ))}
        </div>

        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CSRFTokenField />
              <FormField
                control={form.control}
                name="amountOfSupport"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative mb-2">
                        <Input placeholder="0" {...field} className="pl-6" />
                        <span className="absolute left-3 top-2">$</span>
                      </div>
                    </FormControl>
                    <FormMessage className="font-bold gradient-text pb-1" />
                  </FormItem>
                )}
              />
              <Button type="submit" variant="primary-gradient" size="wide">
                Support this project
              </Button>
            </form>
          </Form>
          <Button variant="outline" size="wide" className="mt-2">
            <Heart /> Follow this project
          </Button>
        </div>

        <FutureEquity {...dataFutureEquity} />
      </PrimaryCard>

      <NftReward nftTiers={nftTiers} viewMode="initial" />
      <ProjectCreator {...dataCreator} />
      <SimilarProject />
    </div>
  );
}

function InfoDetails({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex flex-col basis-1/2">
      <span className="font-semibold text-gray-600">{name}</span>
      <span className="font-bold text-gray-900 text-lg flex items-center">
        {name === "Closing Date" && (
          <Clock className="text-green-600 size-5 mr-1" />
        )}
        {value}
      </span>
    </div>
  );
}
