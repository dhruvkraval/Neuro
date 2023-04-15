from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import textwrap


# Get transcript for given YouTube video id
video_id = "zzMLg3Ys5vI"
transcript = YouTubeTranscriptApi.get_transcript(video_id)

# Format transcript using TextFormatter from youtube_transcript_api library
formatter = TextFormatter()
transcript = formatter.format_transcript(transcript)

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter

import os
import textwrap
import re
import openai

openai.api_key = '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'

PROMPT_STRING = "Write bulletpointed notes of the following:\n\n<<SUMMARY>>\n"


def getVideo():
    # video_ID = input("What is the video URL: ")
    getSummary('zzMLg3Ys5vI')

def getSummary(video_id):
    # Get transcript for given YouTube video id
    transcript = YouTubeTranscriptApi.get_transcript(video_id)

    # Format transcript using TextFormatter from youtube_transcript_api library
    formatter = TextFormatter()
    transcript = formatter.format_transcript(transcript)

    video_length = len(transcript)

    # If the video is ~25 minutes or more, double the chunk size
    # This is done to reduce overall amount of API calls
    chunk_size = 4000 if video_length >= 25000 else 2000

    # Wrap the transcript in chunks of characters
    chunks = textwrap.wrap(transcript, chunk_size)

    summaries = list()

    # For each chunk of characters, generate a summary
    for chunk in chunks:
        prompt = PROMPT_STRING.replace("<<SUMMARY>>", chunk)

        # Generate summary using GPT-3
        # If the davinci model is incurring too much cost, 
        # the text-curie-001 model may be used in its place.
        response = openai.Completion.create(
            model="text-davinci-003", prompt='Write a detailed summary of the following:\n\n<<SUMMARY>>\n', max_tokens=256
        )
        summary = re.sub("\s+", " ", response.choices[0].text.strip())
        summaries.append(summary)

    # Join the chunk summaries into one string
    chunk_summaries = " ".join(summaries)
    prompt = PROMPT_STRING.replace("<<SUMMARY>>", chunk_summaries)

    # Generate a final summary from the chunk summaries
    response = openai.Completion.create(
        model="text-davinci-003", prompt=prompt, max_tokens=2056
    )
    final_summary = re.sub("\s+", " ", response.choices[0].text.strip())

    # # Print out all of the summaries
    # for idx, summary in enumerate(summaries):
    #     print(f"({idx}) - {summary}\n")

    print(f"(Final Summary) - {final_summary}")

    text = final_summary

    # Set up the PDF canvas
    pdf_canvas = canvas.Canvas("summary.pdf", pagesize=letter)

    # Define the width and height of the canvas
    width, height = letter

    # Set the margins for the text
    left_margin = 50
    right_margin = width - 50
    bottom_margin = 50
    top_margin = height - 50

    # Wrap the text to fit within the margins
    wrapped_text = textwrap.wrap(text, width=60)

    # Define the starting position for the text
    y = top_margin

    # Loop through each line of the wrapped text
    for line in wrapped_text:
        # Check if the line will go beyond the bottom margin
        if y < bottom_margin:
            # Add a new page to the PDF
            pdf_canvas.showPage()
            # Reset the starting position for the text
            y = top_margin

        # Add the line of text to the PDF
        pdf_canvas.drawString(left_margin, y, line)
        # Update the starting position for the text
        y -= 15

    # Save the PDF file
    pdf_canvas.save()

    # Save the .txt file
    save_string_to_file(text, "summary.txt")

def save_string_to_file(text, filename):
    with open(filename, 'w') as file:
        file.write(text)

getVideo()