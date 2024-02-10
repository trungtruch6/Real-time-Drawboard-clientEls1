"use client";
import React from "react";
import { EmptyOrg } from "./_components/empty.org";
import { useOrganization } from "@clerk/nextjs";
import { BoardList } from "./_components/board.list";

interface DashboardPageProps {
  searchParams: {
    search?: string;
    favorites?: string;
  };
}

const Page = ({ searchParams }: DashboardPageProps) => {
  const { organization } = useOrganization();
  return (
    <div className="flex-1 h-[calc(100%-80px)] pr-6 md:pl-6 sm:pl-6 2xs:pl-6">
      {!organization ? (
        <EmptyOrg />
      ) : (
        <BoardList orgId={organization.id} query={searchParams} />
      )}
    </div>
  );
};

export default Page;
