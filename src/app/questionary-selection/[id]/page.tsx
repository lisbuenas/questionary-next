"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Header from "@/components/custom/Header";
import useAuthProtection from "@/hooks/useAuthProtection";
import { Question, FormData, QuestionData } from "../../types";
import { getAuthToken } from "@/helpers/auth";

const QuestionnairePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const questionnaireId = params?.id as string;
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [formData, setFormData] = useState<FormData>();
  const [loading, setLoading] = useState(true);

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

        const initialFormData = data.questions.reduce(
          (acc: { [key: string]: string | string[] }, question: Question) => {
            acc[question.id] = question.type === "mcq" ? [] : ""; // default for multiple choice is an empty array
            return acc;
          },
          {}
        );

        const answersResponse = await fetch(`/api/answers/${questionnaireId}`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });

        const answersData = await answersResponse.json();

        console.log({ answersData });

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

        console.log({ initialFormData });
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
    return <div>Loading...</div>; // You can replace this with a loading spinner or skeleton
  }

  if (!isAuthenticated) {
    return null; // The page won't render if not authenticated (the user is already redirected)
  }

  // Handle form input change
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
            : [], // Remove unselected option
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

  // Placeholder function to submit the form
  const submitQuestionnaire = async (
    questionnaireId: string,
    data: FormData
  ) => {
    const response = await fetch(`/api/answers/${questionnaireId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to submit questionnaire");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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

        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((questionData: QuestionData) => {
            console.log({ questionData });
            let obj;
            try {
              obj = questionData?.question
                ? JSON.parse(questionData.question.question)
                : {};
            } catch (error) {
              console.error("Invalid JSON:", error);
              obj = null;
            }
            return (
              <div key={questionData.id} className="space-y-4">
                <label className="block font-semibold">{obj.question}</label>

                {obj.type === "input" ? (
                  <Input
                    value={formData?.[questionData.id] ?? ""}
                    onChange={(e) =>
                      handleInputChange(questionData.id, e.target.value)
                    }
                    placeholder={`Enter ${obj.question}`}
                  />
                ) : (
                  <div className="space-y-2">
                    {obj.options?.map((option: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Checkbox
                          checked={
                            formData?.[questionData.id]?.includes(option) ||
                            false
                          }
                          onCheckedChange={(e: boolean) => {
                            console.log("Clicked!!");
                            console.log(e);

                            handleCheckboxChange(questionData.id, option, e);
                          }}
                        />
                        <label>{option}</label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-end">
            <Button type="submit">Submit Questionnaire</Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default QuestionnairePage;
