import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex items-center justify-center mx-auto">
      <Card className="w-[420px]">
        <CardHeader className="text-center">
          <CardTitle className="text-lg lowercase">nrs-<span className="italic">llmslop</span></CardTitle>
          <CardDescription>A web app for the New Rating System.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p>This is a web application for managing and ranking media entries using the NRS (New Rating System).</p>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Link href="/docs/spec.md" passHref>
              <Button variant="outline">Learn More</Button>
            </Link>
            <Link href="/entries" passHref>
              <Button>Get Started</Button>
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}