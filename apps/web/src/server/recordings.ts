"use server";

import type { Result } from "@zenncore/types/utilities";
import type { Pager, Paginated } from "./types/pagination";
import type { SystemFields } from "./types/system";
import { buildPaginationQuery } from "./utils/pagination";
import { unstable_cacheTag as cacheTag, unstable_expireTag as expireTag } from "next/cache";

export type Recording = SystemFields & {
    duration: number;
    filename: string;
};

export const getAllRecordings = async (pager: Pager): Promise<Result<Paginated<Recording>>> => {
    "use cache";
    cacheTag("recordings")
    try {
        const searchParams = buildPaginationQuery(pager)
        const response = await fetch(`${process.env.NEXT_PUBLIC_PROVIDER_URL}/api/v1/recordings/?${searchParams.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {

            return {
                success: false,
                error: "Failed to fetch recordings",
            };
        }
        return {
            success: true,
            data: await response.json(),
        };
    } catch (error) {
        return {
            success: false,
            error: "Failed to fetch recordings",
        };
    }
}

export const uploadRecording = async (data: FormData): Promise<Result> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_PROVIDER_URL}/api/v1/recordings/`, {
            method: "POST",
            body: data,
        });

        if (!response.ok) {
            return {
                success: false,
                error: JSON.stringify(await response.json()),
            };
        }
        expireTag("recordings")
        return {
            success: true,
        };
    } catch (error) {

        return {
            success: false,
            error: JSON.stringify(error),
        };
    }
}