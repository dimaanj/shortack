"use client";

import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { subscribePush } from "../data/pushApi";

type PushSubscribeInput = {
  userId: string;
  subscription: {
    endpoint: string;
    keys?: {
      auth?: string;
      p256dh?: string;
      [key: string]: string | undefined;
    };
  };
};

export function usePushSubscribe(): UseMutationResult<
  void,
  Error,
  PushSubscribeInput
> {
  return useMutation({
    mutationKey: ["push", "subscribe"],
    mutationFn: (input: PushSubscribeInput) => subscribePush(input),
  });
}

