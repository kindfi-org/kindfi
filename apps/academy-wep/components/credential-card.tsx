import { THEME_COLORS } from "@/app/constants/colors";
import clsx from "clsx";
import { IoMdRibbon } from "react-icons/io";
import { LiaCheckCircleSolid, LiaShieldAltSolid } from "react-icons/lia";
import { TbUsers } from "react-icons/tb";

/**
 * Props for the CredentialCard component
 */
interface CredentialCardProps {
  /** Optional title for the card */
  title?: string;
  /** Optional description for the card */
  description?: string;
  /** Optional array of features to display */
  features?: Array<{
    text: string;
    icon: React.ReactNode;
    color: string;
  }>;
  /** Optional additional class names */
  className?: string;
}

const CredentialCard = ({
  title = "Earn Verifiable Stellar Credentials",
  description = "Complete learning modules to receive NFT badges minted on the Stellar blockchain, showcasing your expertise with immutable proof.",
  features = [
    {
      text: "Blockchain Verified",
      icon: <LiaCheckCircleSolid />,
      color: THEME_COLORS.blockchain.verified,
    },
    {
      text: "Tamper-Proof",
      icon: <LiaShieldAltSolid />,
      color: THEME_COLORS.security.tamperProof,
    },
    {
      text: "Industry Recognized",
      icon: <TbUsers />,
      color: THEME_COLORS.industry.recognized,
    },
  ],
  className = "",
}: CredentialCardProps) => {
  return (
    <div className={clsx("bg-stone-100 pb-8 sm:pb-10 px-4 sm:px-6", className)}>
      <div className="shadow-2xl rounded-md w-full sm:w-4/5 md:w-3/4 lg:w-1/2 mx-auto p-4 sm:p-7">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
          <div className="mx-auto sm:mx-0 sm:self-center">
            <IoMdRibbon className="shadow-xl p-2 rounded-full text-primary text-4xl inline-block h-14 w-14 sm:h-16 sm:w-16" />
          </div>
          <div>
            <h2 className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-center sm:text-left">
              {title}
            </h2>
            <p className="text-secondary text-sm sm:text-base text-center sm:text-left">
              {description}
            </p>

            {/* features */}
            <ul
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 lg:gap-10 mt-4 sm:mt-5 text-xs list-none p-0"
              aria-label="Credential features"
            >
              {features.length === 0 ? (
                <li className="text-secondary">No features available</li>
              ) : (
                features.map((feature) => (
                  <li
                    key={feature.text}
                    className={clsx(feature.color, "flex items-center gap-2")}
                  >
                    {feature.icon && (
                      <span className="self-center">{feature.icon}</span>
                    )}
                    <span>{feature.text}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredentialCard;
