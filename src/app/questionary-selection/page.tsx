"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import useAuthProtection from "@/hooks/useAuthProtection";
import Header from "@/components/custom/Header";

export type Questionnaire = {
  id: string;
  name: string;
};

export default function QuestionarySelection() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questionnaires, setQuestionaries] = useState<Questionnaire[]>([]);

  const { loadingAuth, isAuthenticated } = useAuthProtection();

  useEffect(() => {
    const fetchQuestionnaireData = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/questionnaires`);
        const data = await response.json();
        setQuestionaries(data.questionnaires);

        console.log("Fetched questionnaire data:", data);
      } catch (error) {
        console.error("Error fetching questionnaire data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaireData();
  }, []);

  if (loadingAuth) {
    return <div>Loading...</div>; // You can replace this with a loading spinner or skeleton
  }

  if (!isAuthenticated) {
    return null; // The page won't render if not authenticated (the user is already redirected)
  }

  const handleSelectQuestionnaire = (link: string) => {
    router.push("/questionary-selection/" + link);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Select a Questionnaire
        </h1>

        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin h-8 w-8 text-gray-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {questionnaires.map((questionnaire) => (
              <Card key={questionnaire.id} className="w-full">
                <CardHeader>
                  <CardTitle>{questionnaire.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleSelectQuestionnaire(questionnaire.id)}
                  >
                    Start {questionnaire.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
