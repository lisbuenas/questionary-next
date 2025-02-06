"use client";
import React from "react";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { User } from "../types";
import Header from "@/components/custom/Header";
import { Loader2 } from "lucide-react";
import useAuthProtection from "@/hooks/useAuthProtection";
import QuestionarieForm from "@/components/custom/QuestionnarieForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const AdminPage: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionnarieModal, setQuestionnarieModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [currentQuestionnaire, setCurrentQuestionnaire] = useState({
    username: "",
    questionaryName: "",
  });
  const { loadingAuth, authToken, userRole, isAuthenticated } =
    useAuthProtection();

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);

      fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setUsers(data.users);
        })
        .then(() => {
          setLoading(false);
        });
    }
  }, [authToken, isAuthenticated]);

  const getQuestionaryFromUser = (userId: string, questionaryId: string) => {
    setLoadingQuestions(true);
    setQuestionnarieModal(true);
    fetch(`/api/user-questionaires/${userId}/questionnaire/${questionaryId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data.questions);

        const currentDataObject = data.answers.reduce(
          (
            acc: { [key: string]: string | string[] },
            answer: { questionId: string; answer: string | string[] }
          ) => {
            acc[answer.questionId] = answer.answer;
            return acc;
          },
          {}
        );
        setLoadingQuestions(false);
        setFormData(currentDataObject);
      });
  };

  if (loadingAuth) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (userRole !== "admin") {
    return (
      <>
        You are not authorized to view this page.
        <Button onClick={() => router.push("/questionary-selection")}>
          Back to Questionnaires
        </Button>
      </>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto p-6">
        <p>Welcome to the admin page.</p>

        {loading && (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin h-8 w-8 text-gray-600" />
          </div>
        )}
        {!loading && (
          <Table className="p-4">
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-2">ID</TableHead>
                <TableHead className="px-4 py-2">Username</TableHead>
                <TableHead className="px-4 py-2">Role</TableHead>
                <TableHead className="px-4 py-2">Questionnaries</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id} className="px-4 py-2">
                  <TableCell className="px-4 py-2">{user.id}</TableCell>
                  <TableCell className="px-4 py-2">{user.username}</TableCell>
                  <TableCell className="px-4 py-2">{user.role}</TableCell>
                  <TableCell className="px-4 py-2">
                    {user.userQuestionaries.map((data) => (
                      <div
                        onClick={async () => {
                          getQuestionaryFromUser(user.id, data.id);
                          setCurrentQuestionnaire({
                            username: user.username,
                            questionaryName: data.questionnaire.name,
                          });
                        }}
                        key={data.id}
                      >
                        {data.questionnaire.name}
                      </div>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog
          open={questionnarieModal}
          onOpenChange={() => setQuestionnarieModal(false)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Questionnaire</DialogTitle>
              <DialogDescription>
                {currentQuestionnaire?.username} -{" "}
                {currentQuestionnaire?.questionaryName}
              </DialogDescription>
            </DialogHeader>

            {loadingQuestions && (
              <div className="flex justify-center space-x-4">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              </div>
            )}

            {!loadingQuestions && (
              <QuestionarieForm
                questions={questions}
                formData={formData as any}
                readonly={true}
                handleInputChange={() => {}}
                handleCheckboxChange={() => {}} //  setQuestionnarieModal={setQuestionnarieModal}
              />
            )}
          </DialogContent>
        </Dialog>

        {questionnarieModal && (
          <QuestionarieForm
            questions={questions}
            formData={formData as any}
            readonly={true}
            handleInputChange={() => {}}
            handleCheckboxChange={() => {}} //  setQuestionnarieModal={setQuestionnarieModal}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPage;
