import React from "react";
import { Activity } from 'lucide-react';
import { CircleDollarSign } from 'lucide-react';
import { FolderKanban } from 'lucide-react';
import CustomCard from "@/components/newcomp-test/act-proj/active-card";
import CardWithForm from "@/components/newcomp-test/pen-proj/pending-card";
function YourMainComponent() {
    return (
        <section className="flex">
            <div >
                <CustomCard
                    heading="Active Project"
                    icon={Activity}
                    content="+11 Current active projects"
                />
            </div>
            <div >
                <CustomCard
                    heading="Total Revenue"
                    icon={CircleDollarSign}
                    content="$45,231.89 +20.1% from last month"
                />
            </div>
            <div >
                <CustomCard
                    heading="Oracle Work"
                    icon={FolderKanban}

                />
            </div>
            <div >
                <CardWithForm
                    title="Pending projects"
                    itemCounts={{ total: 15, low: 5, medium: 5, high: 5 }}
                />
            </div>

        </section>
    );
}

export default YourMainComponent;