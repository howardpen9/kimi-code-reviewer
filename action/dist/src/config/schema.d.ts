import { z } from 'zod';
export declare const reviewConfigSchema: z.ZodObject<{
    language: z.ZodDefault<z.ZodEnum<["en", "zh-TW", "zh-CN", "ja", "ko"]>>;
    model: z.ZodDefault<z.ZodString>;
    review: z.ZodDefault<z.ZodObject<{
        auto: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            onOpen: z.ZodDefault<z.ZodBoolean>;
            onPush: z.ZodDefault<z.ZodBoolean>;
            onReviewRequest: z.ZodDefault<z.ZodBoolean>;
            drafts: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            onOpen: boolean;
            onPush: boolean;
            onReviewRequest: boolean;
            drafts: boolean;
        }, {
            enabled?: boolean | undefined;
            onOpen?: boolean | undefined;
            onPush?: boolean | undefined;
            onReviewRequest?: boolean | undefined;
            drafts?: boolean | undefined;
        }>>;
        aspects: z.ZodDefault<z.ZodObject<{
            bugs: z.ZodDefault<z.ZodBoolean>;
            security: z.ZodDefault<z.ZodBoolean>;
            performance: z.ZodDefault<z.ZodBoolean>;
            style: z.ZodDefault<z.ZodBoolean>;
            bestPractices: z.ZodDefault<z.ZodBoolean>;
            documentation: z.ZodDefault<z.ZodBoolean>;
            testing: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            bugs: boolean;
            security: boolean;
            performance: boolean;
            style: boolean;
            bestPractices: boolean;
            documentation: boolean;
            testing: boolean;
        }, {
            bugs?: boolean | undefined;
            security?: boolean | undefined;
            performance?: boolean | undefined;
            style?: boolean | undefined;
            bestPractices?: boolean | undefined;
            documentation?: boolean | undefined;
            testing?: boolean | undefined;
        }>>;
        minSeverity: z.ZodDefault<z.ZodEnum<["critical", "warning", "suggestion", "nitpick"]>>;
        maxAnnotations: z.ZodDefault<z.ZodNumber>;
        failOn: z.ZodDefault<z.ZodEnum<["critical", "warning", "never"]>>;
    }, "strip", z.ZodTypeAny, {
        auto: {
            enabled: boolean;
            onOpen: boolean;
            onPush: boolean;
            onReviewRequest: boolean;
            drafts: boolean;
        };
        aspects: {
            bugs: boolean;
            security: boolean;
            performance: boolean;
            style: boolean;
            bestPractices: boolean;
            documentation: boolean;
            testing: boolean;
        };
        minSeverity: "critical" | "warning" | "suggestion" | "nitpick";
        maxAnnotations: number;
        failOn: "critical" | "warning" | "never";
    }, {
        auto?: {
            enabled?: boolean | undefined;
            onOpen?: boolean | undefined;
            onPush?: boolean | undefined;
            onReviewRequest?: boolean | undefined;
            drafts?: boolean | undefined;
        } | undefined;
        aspects?: {
            bugs?: boolean | undefined;
            security?: boolean | undefined;
            performance?: boolean | undefined;
            style?: boolean | undefined;
            bestPractices?: boolean | undefined;
            documentation?: boolean | undefined;
            testing?: boolean | undefined;
        } | undefined;
        minSeverity?: "critical" | "warning" | "suggestion" | "nitpick" | undefined;
        maxAnnotations?: number | undefined;
        failOn?: "critical" | "warning" | "never" | undefined;
    }>>;
    files: z.ZodDefault<z.ZodObject<{
        include: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        exclude: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        maxFileSize: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        include: string[];
        exclude: string[];
        maxFileSize: number;
    }, {
        include?: string[] | undefined;
        exclude?: string[] | undefined;
        maxFileSize?: number | undefined;
    }>>;
    rules: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        filePattern: z.ZodOptional<z.ZodString>;
        severity: z.ZodDefault<z.ZodEnum<["critical", "warning", "suggestion"]>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        severity: "critical" | "warning" | "suggestion";
        filePattern?: string | undefined;
    }, {
        name: string;
        description: string;
        filePattern?: string | undefined;
        severity?: "critical" | "warning" | "suggestion" | undefined;
    }>, "many">>;
    prompt: z.ZodDefault<z.ZodObject<{
        systemAppend: z.ZodOptional<z.ZodString>;
        reviewFocus: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        systemAppend?: string | undefined;
        reviewFocus?: string | undefined;
    }, {
        systemAppend?: string | undefined;
        reviewFocus?: string | undefined;
    }>>;
    cache: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        ttl: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        ttl: number;
    }, {
        enabled?: boolean | undefined;
        ttl?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    model: string;
    language: "en" | "zh-TW" | "zh-CN" | "ja" | "ko";
    review: {
        auto: {
            enabled: boolean;
            onOpen: boolean;
            onPush: boolean;
            onReviewRequest: boolean;
            drafts: boolean;
        };
        aspects: {
            bugs: boolean;
            security: boolean;
            performance: boolean;
            style: boolean;
            bestPractices: boolean;
            documentation: boolean;
            testing: boolean;
        };
        minSeverity: "critical" | "warning" | "suggestion" | "nitpick";
        maxAnnotations: number;
        failOn: "critical" | "warning" | "never";
    };
    files: {
        include: string[];
        exclude: string[];
        maxFileSize: number;
    };
    rules: {
        name: string;
        description: string;
        severity: "critical" | "warning" | "suggestion";
        filePattern?: string | undefined;
    }[];
    prompt: {
        systemAppend?: string | undefined;
        reviewFocus?: string | undefined;
    };
    cache: {
        enabled: boolean;
        ttl: number;
    };
}, {
    model?: string | undefined;
    language?: "en" | "zh-TW" | "zh-CN" | "ja" | "ko" | undefined;
    review?: {
        auto?: {
            enabled?: boolean | undefined;
            onOpen?: boolean | undefined;
            onPush?: boolean | undefined;
            onReviewRequest?: boolean | undefined;
            drafts?: boolean | undefined;
        } | undefined;
        aspects?: {
            bugs?: boolean | undefined;
            security?: boolean | undefined;
            performance?: boolean | undefined;
            style?: boolean | undefined;
            bestPractices?: boolean | undefined;
            documentation?: boolean | undefined;
            testing?: boolean | undefined;
        } | undefined;
        minSeverity?: "critical" | "warning" | "suggestion" | "nitpick" | undefined;
        maxAnnotations?: number | undefined;
        failOn?: "critical" | "warning" | "never" | undefined;
    } | undefined;
    files?: {
        include?: string[] | undefined;
        exclude?: string[] | undefined;
        maxFileSize?: number | undefined;
    } | undefined;
    rules?: {
        name: string;
        description: string;
        filePattern?: string | undefined;
        severity?: "critical" | "warning" | "suggestion" | undefined;
    }[] | undefined;
    prompt?: {
        systemAppend?: string | undefined;
        reviewFocus?: string | undefined;
    } | undefined;
    cache?: {
        enabled?: boolean | undefined;
        ttl?: number | undefined;
    } | undefined;
}>;
export type ReviewConfig = z.infer<typeof reviewConfigSchema>;
//# sourceMappingURL=schema.d.ts.map