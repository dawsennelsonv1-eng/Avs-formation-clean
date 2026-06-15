"use client";

import { Award, Layers, MessageCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui-tabs";
import { AITutor } from "@/components/learning-ai-tutor";
import { Flashcards } from "@/components/learning-flashcards";
import { Quiz } from "@/components/learning-quiz";
import type { Flashcard, QuizQuestion } from "@/lib/learning-content";
import type { Course } from "@/types";

export function LearningHub({
  course,
  cards,
  quiz,
  signedIn,
}: {
  course: Course;
  cards: Flashcard[];
  quiz: QuizQuestion[];
  signedIn: boolean;
}) {
  const hasCards = cards.length > 0;
  const hasQuiz = quiz.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-ink-2">
      <Tabs defaultValue="tutor">
        <TabsList>
          <TabsTrigger value="tutor">
            <MessageCircle className="h-[15px] w-[15px]" /> IA
          </TabsTrigger>
          {hasCards && (
            <TabsTrigger value="cards">
              <Layers className="h-[15px] w-[15px]" /> Cartes
            </TabsTrigger>
          )}
          {hasQuiz && (
            <TabsTrigger value="quiz">
              <Award className="h-[15px] w-[15px]" /> Quiz
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="tutor">
          <AITutor course={course} signedIn={signedIn} />
        </TabsContent>
        {hasCards && (
          <TabsContent value="cards">
            <Flashcards cards={cards} />
          </TabsContent>
        )}
        {hasQuiz && (
          <TabsContent value="quiz">
            <Quiz questions={quiz} courseId={course.id} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
