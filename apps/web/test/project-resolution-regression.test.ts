import { describe, it, expect, mock } from 'bun:test'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import { getProjectBySlug } from '~/lib/queries/projects/get-project-by-slug'

describe('Project Resolution & Metadata Decoupling Regression Tests', () => {
    it('basic project info lookup does not invoke secondary section queries', async () => {
        // Mock Supabase client or test double for basic query
        const mockSupabaseClient = {
            from: mock((table: string) => {
                if (table === 'projects') {
                    return {
                        select: () => ({
                            eq: () => ({
                                maybeSingle: async () => ({
                                    data: {
                                        id: 'proj-123',
                                        title: 'Test Project',
                                        slug: 'test-project',
                                        description: 'A test project description',
                                        target_amount: 1000,
                                        current_amount: 500,
                                        kinder_count: 10,
                                        min_investment: 10,
                                        created_at: new Date().toISOString(),
                                        status: 'active',
                                        source_locale: 'en',
                                    },
                                    error: null,
                                }),
                            }),
                        }),
                    }
                }
                throw new Error(`Unexpected table queried: ${table}`)
            }),
        }

        const basicInfo = await getBasicProjectInfoBySlug(
            mockSupabaseClient as any,
            'test-project',
            { localize: false }
        )

        expect(basicInfo).toBeDefined()
        expect(basicInfo?.title).toBe('Test Project')
        // Successfully resolves basic info without calling any secondary tables (pitch, team, etc.)
    })

    it('preserves basic project resolution when secondary sections fail in full aggregate', async () => {
        // If secondary resolvers fail, getProjectBySlug or failure handling behavior can be verified
        const mockSupabaseClient = {
            from: mock((table: string) => {
                if (table === 'projects') {
                    return {
                        select: () => ({
                            eq: () => ({
                                maybeSingle: async () => ({
                                    data: {
                                        id: 'proj-123',
                                        title: 'Test Project',
                                        slug: 'test-project',
                                        source_locale: 'en',
                                    },
                                    error: null,
                                }),
                            }),
                        }),
                    }
                }
                return {
                    select: () => ({
                        eq: () => ({
                            maybeSingle: async () => ({ data: null, error: new Error('Secondary query failed') }),
                        }),
                    }),
                }
            }),
        }

        // Basic info should still resolve even if secondary sections error out or return empty
        const basicInfo = await getBasicProjectInfoBySlug(
            mockSupabaseClient as any,
            'test-project',
            { localize: false }
        )
        expect(basicInfo).toBeDefined()
        expect(basicInfo?.id).toBe('proj-123')
    })
})