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

type CallbackState = "loading" | "success" | "error";

function ZaloOACallbackPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<CallbackState>("loading");
  const [message, setMessage] = useState<string>("");
  const [errorDetails, setErrorDetails] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract OAuth callback parameters
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        // Handle OAuth error response
        if (error) {
          const errorMsg =
            errorDescription || error || "Đã xảy ra lỗi khi xác thực";
          setState("error");
          setMessage("Không thể kết nối tài khoản Zalo OA");
          setErrorDetails(errorMsg);
          toast.error(errorMsg, { position: "bottom-right" });
          return;
        }

        // Check if code is present
        if (!code) {
          setState("error");
          setMessage("Thiếu mã xác thực");
          setErrorDetails(
            "Không tìm thấy mã xác thực trong URL. Vui lòng thử lại."
          );
          toast.error("Thiếu mã xác thực", { position: "bottom-right" });
          return;
        }

        const response = await axios.post(`${BASE_URL}/link/zalo-oa`, {
          method: "POST",
          body: JSON.stringify({
            code,
          }),
        });

        if (response.status !== 200) {
          const errorData = response.data;
          const errorMsg =
            errorData.message || "Không thể kết nối tài khoản Zalo OA";
          setState("error");
          setMessage("Kết nối thất bại");
          setErrorDetails(errorMsg);
          toast.error(errorMsg, { position: "bottom-right" });
          return;
        }

        const data = await response.data;
        setState("success");
        setMessage(data.message || "Đã kết nối tài khoản Zalo OA thành công!");
        toast.success("Đã kết nối tài khoản Zalo OA thành công!", {
          position: "bottom-right",
        });

        // Auto redirect after 3 seconds on success
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error("ZaloOA callback error:", error);
        setState("error");
        setMessage("Đã xảy ra lỗi");
        setErrorDetails(error.message || "Không thể xử lý yêu cầu");
        toast.error("Đã xảy ra lỗi khi xử lý callback", {
          position: "bottom-right",
        });
      }
    };

    void handleCallback().catch((error) => {
      console.error("ZaloOA callback error:", error);
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
                Đang kết nối tài khoản Zalo OA của bạn...
              </p>
            </div>
          )}

          {state === "success" && (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg">
                <p className="text-sm text-emerald-800 dark:text-emerald-100">
                  Tài khoản Zalo OA đã được kết nối thành công. Bạn sẽ được
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
                  // Retry by going back to connection modal or redirect URL
                  const redirectUrl =
                    process.env
                      .NEXT_PUBLIC_ZALO_OA_REQUEST_PERMISSION_APP_URL || "/";
                  window.location.href = redirectUrl;
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

export default function ZaloOACallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Icons.spinner className="w-16 h-16 text-blue-500 animate-spin" />
        </div>
      }
    >
      <ZaloOACallbackPageInner />
    </Suspense>
  );
}
