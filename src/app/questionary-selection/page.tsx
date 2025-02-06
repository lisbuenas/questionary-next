"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import useAuthProtection from "@/hooks/useAuthProtection";
import Header from "@/components/custom/Header";
import { getAuthToken } from "@/helpers/auth";
import { Questionnaire } from "../types";
import { Check } from "lucide-react";

export default function QuestionarySelection() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questionnaires, setQuestionaries] = useState<Questionnaire[]>([]);
  const { loadingAuth, isAuthenticated } = useAuthProtection();

  useEffect(() => {
    const fetchQuestionnaireData = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/questionnaires`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        const data = await response.json();
        setQuestionaries(data.questionnaires);
      } catch (error) {
        console.error("Error fetching questionnaire data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaireData();
  }, [loadingAuth]);

  if (loadingAuth) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
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
                  <div className="h-12">
                    {questionnaire?.userQuestionnaire &&
                      questionnaire.userQuestionnaire.length > 0 && (
                        <>
                          <span className="float-left">Answered</span>
                          <Check size={24} color="green" />
                        </>
                      )}
                  </div>
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
