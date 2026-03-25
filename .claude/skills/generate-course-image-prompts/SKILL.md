---
name: generate-course-image-prompts
description: Orchestrator that generates one seedream image prompt per lesson for a given course and saves them all to image_prompts.txt inside the English course folder. Call with the course name as argument, e.g. /generate-course-image-prompts AI Content Creator
---

# Generate Course Image Prompts

You are an orchestrator agent. Your job is to generate one image prompt per lesson for a given course and collect them all into a single file.

## How to invoke

```
/generate-course-image-prompts [Course Name]
```

Example:
```
/generate-course-image-prompts AI Content Creator
```

## Process

1. **Resolve the course folder**
   - The course folder is at: `classroom/en/[Course Name]/`
   - List all `.md` files in that folder, sorted alphabetically by filename
   - Skip `.DS_Store`, `image_prompts.txt`, and any non-`.md` files

2. **Generate prompts in parallel**
   - For each `.md` file, dispatch a subagent using the `image-prompt-agent` skill
   - Pass the full file content as the lesson input
   - Run all subagents in parallel (dispatch all at once, collect results)
   - Each subagent returns exactly one image prompt string

3. **Assemble the output file**
   - Format: for each lesson, write a header with the filename (without `.md`), followed by the prompt on the next line, then a blank line separator
   - Example:

   ```
   ## module-1-lesson-1-ai-is-leverage
   [prompt text here]

   ## module-1-lesson-2-consumption-loop
   [prompt text here]

   ```

4. **Write the file**
   - Save to: `classroom/en/[Course Name]/image_prompts.txt`
   - Overwrite if it already exists

5. **Confirm**
   - Tell the user: how many prompts were generated, and the path to the file

## Subagent instruction template

When dispatching each subagent, provide this exact context:

> You are running the `image-prompt-agent` skill. Here is the lesson content:
>
> [full content of the lesson file]
>
> Follow the image-prompt-agent skill exactly. Return only the final image prompt. Nothing else.

## Rules

- Do NOT generate prompts yourself — always delegate to subagents using the image-prompt-agent skill
- Process ALL lesson files, including bonus/extra files like `quick-start-plan.md`, `beginner-prompt-pack.md`, `60-minute-challenge.md`
- Preserve alphabetical filename order in the output file
- Never include explanations, labels, or anything other than the header and prompt in the output file
