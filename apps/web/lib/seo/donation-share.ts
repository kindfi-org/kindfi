import {
	getProjectPageUrl,
	getProjectShareDescription,
	truncateMetaDescription,
} from './project-metadata'

export interface DonationShareInput {
	projectTitle: string
	projectSlug: string
	projectDescription?: string | null
	contributionAmount?: number
}

export interface DonationShareContent {
	url: string
	title: string
	description: string
}

export const getDonationShareTitle = (projectTitle: string): string =>
	`I just supported ${projectTitle} on KindFi — join me!`

export const getDonationShareDescription = ({
	projectTitle,
	projectDescription,
	contributionAmount,
}: Omit<DonationShareInput, 'projectSlug'>): string => {
	const projectPitch = getProjectShareDescription(projectTitle, projectDescription ?? null)

	if (contributionAmount !== undefined && contributionAmount > 0) {
		const formattedAmount = new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0,
		}).format(contributionAmount)

		return truncateMetaDescription(
			`I donated ${formattedAmount} to ${projectTitle}. ${projectPitch}`,
		)
	}

	return projectPitch
}

export const getDonationShareContent = ({
	projectTitle,
	projectSlug,
	projectDescription,
	contributionAmount,
}: DonationShareInput): DonationShareContent => ({
	url: getProjectPageUrl(projectSlug),
	title: getDonationShareTitle(projectTitle),
	description: getDonationShareDescription({
		projectTitle,
		projectDescription,
		contributionAmount,
	}),
})
