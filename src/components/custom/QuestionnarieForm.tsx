import { QuestionData } from "@/app/types";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";

export interface QuestionarieFormProps {
  questions: QuestionData[];
  formData: FormData | undefined;
  handleInputChange: (questionId: string, value: string) => void;
  handleCheckboxChange: (
    questionId: string,
    option: string,
    checked: boolean
  ) => void;
  readonly?: boolean;
}

const QuestionarieForm: React.FC<QuestionarieFormProps> = ({
  questions,
  formData,
  handleInputChange,
  handleCheckboxChange,
  readonly = false,
}) => {
  return (
    <>
      {questions.map((questionData: QuestionData, index) => {
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
                disabled={readonly}
                value={(formData as any)?.[questionData.id] ?? ""}
                onChange={(e) =>
                  handleInputChange &&
                  handleInputChange(questionData.id, e.target.value)
                }
                placeholder={`Enter ${obj.question}`}
              />
            ) : (
              <div className="space-y-2">
                {obj.options?.map((option: string, index2: number) => (
                  <div
                    key={index + index2}
                    className="flex items-center space-x-3"
                  >
                    <Checkbox
                      checked={
                        (formData as any)?.[questionData.id]?.includes(
                          option
                        ) || false
                      }
                      disabled={readonly}
                      onCheckedChange={(e: boolean) => {
                        handleCheckboxChange &&
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
    </>
  );
};

export default QuestionarieForm;
