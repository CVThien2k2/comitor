"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "@workspace/ui/components/sonner";
import { Icons } from "@/components/global/icons";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_VERSION = "v1";

if (!NEXT_PUBLIC_API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

const BASE_URL = `${NEXT_PUBLIC_API_URL}/${API_VERSION}/accounts`;

const META_OAUTH_CLIENT_ID = "1640809023567527";
const META_OAUTH_SCOPE =
  "pages_show_list,pages_messaging,pages_manage_metadata,business_management,pages_read_engagement";

function getMetaRedirectUri(): string {
  const env = process.env.NEXT_PUBLIC_ENV;
  if (env === "production") {
    return process.env.NEXT_PUBLIC_META_REDIRECT_URI_PRODUCTION ?? "";
  }
  return process.env.NEXT_PUBLIC_META_REDIRECT_URI_DEV ?? "";
}

function buildMetaOAuthUrl(): string {
  const redirectUri = getMetaRedirectUri();
  const params = new URLSearchParams({
    client_id: META_OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: META_OAUTH_SCOPE,
    response_type: "code",
  });
  return `https://www.facebook.com/v24.0/dialog/oauth?${params.toString()}`;
}

type CallbackState = "loading" | "success" | "error";

function MetaCallbackPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<CallbackState>("loading");
  const [message, setMessage] = useState<string>("");
  const [errorDetails, setErrorDetails] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
          const errorMsg =
            errorDescription || error || "Đã xảy ra lỗi khi xác thực";
          setState("error");
          setMessage("Không thể kết nối tài khoản Meta/Facebook");
          setErrorDetails(errorMsg);
          toast.error(errorMsg, { position: "bottom-right" });
          return;
        }

        if (!code) {
          setState("error");
          setMessage("Thiếu mã xác thực");
          setErrorDetails(
            "Không tìm thấy mã xác thực trong URL. Vui lòng thử lại."
          );
          toast.error("Thiếu mã xác thực", { position: "bottom-right" });
          return;
        }

        const response = await axios.post(`${BASE_URL}/link/meta-app`, {
          method: "POST",
          body: JSON.stringify({ code }),
        });

        if (response.status !== 200) {
          const errorData = response.data;
          const errorMsg =
            errorData.message || "Không thể kết nối tài khoản Meta/Facebook";
          setState("error");
          setMessage("Kết nối thất bại");
          setErrorDetails(errorMsg);
          toast.error(errorMsg, { position: "bottom-right" });
          return;
        }

        const data = await response.data;
        setState("success");
        setMessage(
          data.message || "Đã kết nối tài khoản Meta/Facebook thành công!"
        );
        toast.success("Đã kết nối tài khoản Meta/Facebook thành công!", {
          position: "bottom-right",
        });

        setTimeout(() => {
          router.push("/");
        }, 3000);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error("Meta callback error:", error);
        setState("error");
        setMessage("Đã xảy ra lỗi");
        setErrorDetails(error.message || "Không thể xử lý yêu cầu");
        toast.error("Đã xảy ra lỗi khi xử lý callback", {
          position: "bottom-right",
        });
      }
    };

    void handleCallback().catch((error) => {
      console.error("Meta callback error:", error);
      setState("error");
      setMessage("Đã xảy ra lỗi");
      setErrorDetails(error.message || "Không thể xử lý yêu cầu");
      toast.error("Đã xảy ra lỗi khi xử lý callback", {
        position: "bottom-right",
      });
    });
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {state === "loading" && (
              <Icons.spinner className="w-16 h-16 text-blue-500 animate-spin" />
            )}
            {state === "success" && (
              <Icons.checkCircle2 className="w-16 h-16 text-emerald-500" />
            )}
            {state === "error" && (
              <Icons.xCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {state === "loading" && "Đang xử lý..."}
            {state === "success" && "Kết nối thành công!"}
            {state === "error" && "Kết nối thất bại"}
          </CardTitle>
          <CardDescription className="mt-2">
            {state === "loading" && "Vui lòng đợi trong giây lát"}
            {state === "success" && message}
            {state === "error" && message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state === "loading" && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Đang kết nối tài khoản Meta/Facebook của bạn...
              </p>
            </div>
          )}

          {state === "success" && (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg">
                <p className="text-sm text-emerald-800 dark:text-emerald-100">
                  Tài khoản Meta/Facebook đã được kết nối thành công. Bạn sẽ được
                  chuyển hướng trong giây lát...
                </p>
              </div>
            </div>
          )}

          {state === "error" && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-100">
                  {errorDetails || "Đã xảy ra lỗi khi kết nối tài khoản."}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Nếu vấn đề vẫn tiếp tục, vui lòng:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Kiểm tra kết nối internet của bạn</li>
                  <li>Đảm bảo bạn đã cấp quyền đầy đủ cho ứng dụng</li>
                  <li>Thử kết nối lại từ đầu</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {state === "success" && (
            <Button
              onClick={() => router.push("/")}
              className="w-full"
              variant="default"
            >
              Về trang chủ
            </Button>
          )}
          {state === "error" && (
            <div className="flex gap-2 w-full">
              <Button
                onClick={() => router.push("/")}
                className="flex-1"
                variant="outline"
              >
                Về trang chủ
              </Button>
              <Button
                onClick={() => {
                  window.location.href = buildMetaOAuthUrl();
                }}
                className="flex-1"
                variant="default"
              >
                Thử lại
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default function MetaCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Icons.spinner className="w-16 h-16 text-blue-500 animate-spin" />
        </div>
      }
    >
      <MetaCallbackPageInner />
    </Suspense>
  );
}
