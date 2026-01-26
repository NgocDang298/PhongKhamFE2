import React from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import Button from "./Button";
import Select from "./Select";

interface PaginationProps {
    total: number;
    limit: number;
    skip: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    pageSizeOptions?: number[];
}

export default function Pagination({
    total,
    limit,
    skip,
    onPageChange,
    onLimitChange,
    pageSizeOptions = [10, 20, 50, 100],
}: PaginationProps) {
    const currentPage = Math.floor(skip / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    if (total === 0) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            if (endPage === totalPages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }
        return pages;
    };

    const startIdx = skip + 1;
    const endIdx = Math.min(skip + limit, total);

    return (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-4 gap-4">
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 whitespace-nowrap">
                    Hiển thị {startIdx} - {endIdx} / {total}
                </span>
                <div className="w-32">
                    <Select
                        value={limit.toString()}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        options={pageSizeOptions.map((opt) => ({
                            value: opt.toString(),
                            label: `${opt} / trang`,
                        }))}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    icon={<IconChevronLeft size={16} />}
                >
                    Trước
                </Button>

                <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`px-3 py-1 text-sm rounded-md min-h-10 transition-colors min-w-10 ${currentPage === pageNum
                                ? "bg-primary text-white font-semibold"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    icon={<IconChevronRight size={16} />}
                >
                    Sau
                </Button>
            </div>
        </div>
    );
}
