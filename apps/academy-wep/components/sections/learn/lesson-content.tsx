import type { LessonContent as LessonContentType } from "~/lib/types/learn/lesson.types"
import { Card, CardContent } from "~/components/base/card"

interface LessonContentProps {
  content: LessonContentType
}

export function LessonContent({ content }: LessonContentProps) {
  return (
    <Card className="rounded-2xl bg-background shadow-md mt-6">
      <CardContent className="p-8 space-y-8">
        {/* Lesson Title */}
        <h1 className="text-3xl font-extrabold text-foreground">{content.title}</h1>

        {/* Lesson Sections */}
        <div className="space-y-6">
          {content.content.map((section) => {
            if (section.type === "paragraph") {
              return (
                <p key={section.id} className="text-base text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              )
            }

            if (section.type === "heading") {
              return (
                <h2 key={section.id} className="text-2xl font-bold text-foreground mt-8">
                  {section.content}
                </h2>
              )
            }

            if (section.type === "subheading") {
              return (
                <h3 key={section.id} className="text-xl font-bold text-foreground mt-6">
                  {section.content}
                </h3>
              )
            }

            if (section.type === "bulletList" && section.items) {
              return (
                <ul key={section.id} className="list-disc list-inside pl-2 space-y-2 marker:text-gray-300">
                  {section.items.map((item) => (
                    <li key={item.id} className="text-base text-muted-foreground leading-relaxed">
                      <span className="font-bold text-foreground">{item.title}</span> {item.description}
                    </li>
                  ))}
                </ul>
              )
            }

            return null
          })}
        </div>
      </CardContent>
    </Card>
  )
}
