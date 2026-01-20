import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function WeeklyContestCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow p-8 h-full flex flex-col justify-center">
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Compiles on first try? Suspicious.
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            Master Data Structures<br />and Algorithms
          </h1>
          
          <p className="text-sm font-medium text-slate-600 max-w-2xl">
            A curated DSA sheet platform designed for students to track progress,<br />
            explore categorized problems, and enhance coding skills.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <Button asChild size="default" className="bg-slate-900 text-white hover:bg-slate-800 font-semibold">
            <Link to="/problems">
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="default" className="border-slate-300 text-slate-900 hover:bg-slate-50 font-semibold">
            <Link to="/topics">
              Browse DSA Sheet
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
