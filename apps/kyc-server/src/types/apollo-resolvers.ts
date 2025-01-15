import { gql } from 'apollo-server-express'

// Define the GraphQL schema for KYC applications
export const apolloTypeDef = gql`
  type KycApplication {
    id: ID!
    applicantName: String!
    applicantEmail: String!
    status: String!
    verificationData: String
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    getKycApplications: [KycApplication!]!  // Fetch all KYC applications
    getKycApplication(id: ID!): KycApplication  // Fetch a specific KYC application by ID
  }

  type Mutation {
    createKycApplication(applicantName: String!, applicantEmail: String!): KycApplication!  // Create a new KYC application
    updateKycApplication(id: ID!, status: String!): KycApplication!  // Update the status of an existing KYC application
  }
`
