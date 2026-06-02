import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (items: number) => void;
    itemsPerPageOptions?: number[];
}

export function Pagination({
    totalItems,
    itemsPerPage,
    currentPage,
    onPageChange,
    onItemsPerPageChange,
    itemsPerPageOptions = [5, 10, 20, 50],
    className,
    ...props
}: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    // Handle changing the page safely
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    // Calculate item ranges
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Compute which page buttons to show (maximum of 5 page buttons shown)
    const getPageNumbers = () => {
        const pages: number[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, currentPage + 2);

            if (currentPage <= 3) {
                start = 1;
                end = maxVisiblePages;
            } else if (currentPage >= totalPages - 2) {
                start = totalPages - maxVisiblePages + 1;
                end = totalPages;
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div
            className={cn(
                "flex flex-col sm:flex-row items-center justify-end gap-4 py-4 text-xs text-[#8f6f64] font-medium transition-all duration-200 bg-transparent shadow-none border-none",
                className
            )}
            {...props}
        >


            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
                {/* First Page */}
                <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-[#fcd5ce]/50 bg-white text-[#8f6f64] hover:bg-[#fff8f6] hover:text-[#ff385c] hover:border-[#ff385c] disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#8f6f64] disabled:hover:border-[#fcd5ce]/50 transition-all cursor-pointer shadow-none"
                    title="Trang đầu"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </button>

                {/* Prev Page */}
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-[#fcd5ce]/50 bg-white text-[#8f6f64] hover:bg-[#fff8f6] hover:text-[#ff385c] hover:border-[#ff385c] disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#8f6f64] disabled:hover:border-[#fcd5ce]/50 transition-all cursor-pointer shadow-none"
                    title="Trang trước"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page Numbers */}
                {pageNumbers[0] > 1 && (
                    <>
                        <button
                            onClick={() => handlePageChange(1)}
                            className="h-7 w-7 rounded-lg border border-[#fcd5ce]/50 bg-white flex items-center justify-center hover:bg-[#fff8f6] hover:text-[#ff385c] hover:border-[#ff385c] transition-all cursor-pointer shadow-none font-bold"
                        >
                            1
                        </button>
                        {pageNumbers[0] > 2 && <span className="px-1 text-[#caa79a]">...</span>}
                    </>
                )}

                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={cn(
                            "h-7 w-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-none font-bold text-xs",
                            currentPage === page
                                ? "bg-[#ff385c] border-[#ff385c] text-white font-extrabold"
                                : "border-[#fcd5ce]/50 bg-white text-[#3f2d28] hover:bg-[#fff8f6] hover:text-[#ff385c] hover:border-[#ff385c]"
                        )}
                    >
                        {page}
                    </button>
                ))}

                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                            <span className="px-1 text-[#caa79a]">...</span>
                        )}
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            className="h-7 w-7 rounded-lg border border-[#fcd5ce]/50 bg-white flex items-center justify-center hover:bg-[#fff8f6] hover:text-[#ff385c] hover:border-[#ff385c] transition-all cursor-pointer shadow-none font-bold"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                {/* Next Page */}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-[#fcd5ce]/50 bg-white text-[#8f6f64] hover:bg-[#fff8f6] hover:text-[#ff385c] hover:border-[#ff385c] disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#8f6f64] disabled:hover:border-[#fcd5ce]/50 transition-all cursor-pointer shadow-none"
                    title="Trang sau"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>

                {/* Last Page */}
                <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-[#fcd5ce]/50 bg-white text-[#8f6f64] hover:bg-[#fff8f6] hover:text-[#ff385c] hover:border-[#ff385c] disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#8f6f64] disabled:hover:border-[#fcd5ce]/50 transition-all cursor-pointer shadow-none"
                    title="Trang cuối"
                >
                    <ChevronsRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
