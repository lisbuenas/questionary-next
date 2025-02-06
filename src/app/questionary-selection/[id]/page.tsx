"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Header from "@/components/custom/Header";
import useAuthProtection from "@/hooks/useAuthProtection";
import { Question, FormData, QuestionData } from "../../types";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { getAuthToken } from "@/helpers/auth";
import QuestionarieForm from "@/components/custom/QuestionnarieForm";

const QuestionnairePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const questionnaireId = params?.id as string;
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [formData, setFormData] = useState<FormData>();
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const { loadingAuth, isAuthenticated } = useAuthProtection();

  useEffect(() => {
    const fetchQuestionnaireData = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/questionnaires/${questionnaireId}`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });

        const data = await response.json();
        setQuestions(data.questions);

        const answersResponse = await fetch(`/api/answers/${questionnaireId}`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });

        const answersData = await answersResponse.json();
        const currentDataObject = answersData.reduce(
          (
            acc: { [key: string]: string | string[] },
            answer: { questionId: string; answer: string | string[] }
          ) => {
            acc[answer.questionId] = answer.answer;
            return acc;
          },
          {}
        );

        setFormData(currentDataObject);
      } catch (error) {
        console.error("Error fetching questionnaire data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaireData();
  }, [questionnaireId]);

  if (loadingAuth) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleInputChange = (id: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleCheckboxChange = (
    id: string,
    option: string,
    checked: boolean
  ) => {
    setFormData((prevData) => {
      const updatedValue = prevData?.[id] || [];
      if (checked) {
        return {
          ...prevData,
          [id]: [...updatedValue, option], // Add selected option
        };
      } else {
        return {
          ...prevData,
          [id]: Array.isArray(updatedValue)
            ? updatedValue.filter((value: string) => value !== option)
            : [],
        };
      }
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form data:", formData);
    try {
      if (formData) {
        await submitQuestionnaire(questionnaireId, formData);
      } else {
        console.error("Form data is undefined");
      }
      router.push("/questionary-selection");
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  const submitQuestionnaire = async (
    questionnaireId: string,
    data: FormData
  ) => {
    setLoadingSubmit(true);
    const response = await fetch(`/api/answers/${questionnaireId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    setLoadingSubmit(false);

    if (!response.ok) {
      throw new Error("Failed to submit questionnaire");
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-6">
        <header className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold">Questionnaire</h1>
          <Button onClick={() => router.push("/questionary-selection")}>
            Back to Questionnaires
          </Button>
        </header>

        {loading && (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin h-8 w-8 text-gray-600" />
          </div>
        )}

        <Dialog open={loadingSubmit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submiting the answers</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            <div className="flex justify-center space-x-4">
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
            </div>
          </DialogContent>
        </Dialog>

        <form onSubmit={handleSubmit} className="space-y-8">
          <QuestionarieForm
            questions={questions}
            formData={formData as any}
            handleInputChange={handleInputChange}
            handleCheckboxChange={handleCheckboxChange}
          />

          <div className="flex justify-end">
            <Button disabled={loading} type="submit">
              Submit Questionnaire
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default QuestionnairePage;
