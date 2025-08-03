import React from "react";
import { RxCross2 } from "react-icons/rx";
function ToastCard({ title, description, Icon, type }) {
    return (
        <>
            {/* container */}
            <div className="bg-[#fff] border border-border-color rounded-lg w-full max-w-[350px] flex gap-3 shadow-lg">
                {/* left side container */}
                <div
                    className={`flex justify-center items-center w-1/5 rounded-lg ${type === "success"
                        ? "bg-[#28a745]"
                        : type === "error"
                            ? "bg-[#dc3545]"
                            : "bg-[#ffc107 ]"
                        }`}
                >
                    {/* check icon container */}
                    <div className="border-[2px] border-[#fff] rounded-full">
                        {/* check icon */}
                        <span className="text-[#fff]">{Icon}</span>
                    </div>
                </div>
                {/* right side container */}
                <div className="w-4/5">
                    {/* right side content */}
                    <div>
                        {/* right side header */}
                        <div className="flex justify-between">
                            {/* right side title */}
                            <h1 className={`mt-1 text-lg  font-rubik font-semibold ${type === "success" ? "text-[#28a745]" : type === "error" ? "text-[#dc3545]" : "text-[#ffc107 ]"}`}>{title}</h1>
                            {/* cross icon */}
                            <span className="mr-1 mt-1 text-primary-text font-bold">
                                <RxCross2 />
                            </span>
                        </div>
                        {/* right side para */}
                        <p className="text-sm text-primary-text font-inter">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ToastCard;