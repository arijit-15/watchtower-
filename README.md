
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


# WATCHTOWER-AI
Watchtower-AI is a web application built using Next.js and Shadcn UI. It utilizes TensorFlow.js for object detection to detect a person from a webcam feed and draw a red rectangular canvas around them. Additionally, it offers features such as taking screenshots, video recording, and auto-recording when a person is detected.



## Features

- Object Detection: Utilizes TensorFlow.js for real-time object detection to identify a person from the webcam feed.
- Canvas Drawing: Draws a red rectangular canvas around the detected person for visualization.
- Screenshot Capture: Allows users to capture screenshots from the webcam feed.
- Video Recording: Enables users to record videos from the webcam feed.
- Auto-Recording: Automatically starts recording when a person is detected in the frame.


## Tech Stack

- Next.js: A React framework for building server-side rendered web applications.

- Shadcn UI: A UI component library for React, providing pre-styled components for easy integration.
- TensorFlow.js: A JavaScript library for training and deploying machine learning models in the browser and on Node.js.


## Installation

Clone the repository:

```bash
  git clone https://github.com/your-username/watchtower-ai.git

```
Navigate to the project directory:
```bash
  cd watchtower-ai

```
Install dependencies:
```bash
npm install

```
Start the development server:
```bash
npm run dev

```
Open your web browser and visit http://localhost:3000 to view the application.
    
## Usage/Examples
- Allow access to your webcam when prompted.
- The application will start detecting persons in the webcam feed and drawing a red rectangular canvas around them.
- Use the provided buttons to take screenshots or start/stop video recording.
- Enable auto-recording to automatically start recording when a person is detected.


## Contributing

Contributions are always welcome!

See `contributing.md` for ways to get started.

Please adhere to this project's `code of conduct`.


## License

 This project is licensed under the [MIT](https://choosealicense.com/licenses/mit/)


