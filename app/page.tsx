"use client"
import SocialMediaLinks from "@/components/social-links";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import Slider from '@mui/material/Slider';
import { cn } from "@/lib/utils"
import { beep } from "@/utils/audio";
import { drawOnCanvas } from "@/utils/draw";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Separator } from "@radix-ui/react-separator";
import * as cocossd from '@tensorflow-models/coco-ssd';
import { DetectedObject, ObjectDetection } from "@tensorflow-models/coco-ssd";
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import { Camera, FlipHorizontal, MoonIcon, PersonStanding, SunIcon, Video, Volume2 } from "lucide-react";
import { Fira_Sans_Extra_Condensed } from "next/font/google";
import React, { useEffect, useRef, useState } from "react";
import { Rings } from "react-loader-spinner";
import Webcam from "react-webcam";
import { toast } from "sonner";
import { ChangeEvent } from "react";
type Props = {}

let interval: any = null
let stopTimeout: any = null
const HomePage = (props: Props) => {
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const volumeSliderRef = useRef(null);

  //state
  const [mirrored, setMirrored] = useState<boolean>(true)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [autoRecordEnabled, setAutoRecordEnabled] = useState<boolean>(false)
  const [volume, setVolume] = useState(0.8)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [model, setModel] = useState<ObjectDetection>()
  const [loading, setLoading] = useState(false)


  const handleVolumeChange = (event: Event, newValue: number | number[], activeThumb: number) => {
    const newVolume = typeof newValue === 'number' ? newValue : newValue[0];
    setVolume(newVolume);
    beep(newVolume);
  };

  const toggleVolumeSlider = () => {
    setShowVolumeSlider((prev) => !prev);
  };

  const playNotificationSound = () => {
    beep(volume);
  };


  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [inactiveTimeout, setInactiveTimeout] = useState<NodeJS.Timeout | null>(null);




  useEffect(() => {
    document.addEventListener("mousemove", resetInactiveTimeout);
    document.addEventListener("keypress", resetInactiveTimeout);
    return () => {
      document.removeEventListener("mousemove", resetInactiveTimeout);
      document.removeEventListener("keypress", resetInactiveTimeout);
    };
  }, []);

  function resetInactiveTimeout() {
    if (inactiveTimeout) {
      clearTimeout(inactiveTimeout);
    }
    setInactiveTimeout(setTimeout(handleInactive, 30000)); // Set timeout for 30 seconds (adjust as needed)
  }

  function handleInactive() {
    // Show warning or trigger other actions
    showNotificationAndWarning();
  }

  function showNotificationAndWarning() {
    // Play notification sound
    toast("You have been inactive!"); // Show warning message using your toast function
  }

  //initialize media recorder
  useEffect(() => {
    if (webcamRef && webcamRef.current) {
      const stream = (webcamRef.current.video as any).captureStream();
      if (stream) {
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            const recordedBlob = new Blob([e.data], { type: 'video' });
            const videoURL = URL.createObjectURL(recordedBlob);

            const a = document.createElement('a');
            a.href = videoURL;
            a.download = `${formatDate(new Date())}.webm`;
            a.click();
          }

        }
        mediaRecorderRef.current.onstart = (e) => {
          setIsRecording(true);
        }
        mediaRecorderRef.current.onstop = (e) => {
          setIsRecording(false);
        }
      }
    }
  }, [webcamRef])

  useEffect(() => {
    setLoading(true)
    initModel();
  }, [])

  //loads model
  //set it in a state variable

  async function initModel() {
    const loadedModel: ObjectDetection = await cocossd.load({
      base: 'mobilenet_v2'
    })
    setModel(loadedModel)
  }

  useEffect(() => {
    if (model) {
      setLoading(false)
    }
  }, [model])

  async function runPrediction() {
    if (
      model
      && webcamRef.current
      && webcamRef.current.video
      && webcamRef.current.video.readyState === 4
    ) {
      const predictions: DetectedObject[] = await model.detect(webcamRef.current.video);
      // console.log(predictions)
      resizeCanvas(canvasRef, webcamRef);
      drawOnCanvas(mirrored, predictions, canvasRef.current?.getContext('2d'))
      let isPerson: boolean = false;
      if (predictions.length > 0) {
        predictions.forEach((prediction) => {
          isPerson = prediction.class === 'person';
        })

        if (isPerson && autoRecordEnabled) {
          startRecording(true);
        }
      }
    }

    // Function to start recording

  }


  useEffect(() => {
    interval = setInterval(() => {
      runPrediction();
    }, 100)
    return () => clearInterval(interval);
  }, [webcamRef.current, model, mirrored, autoRecordEnabled])

  return (


    <div className="flex h-screen" style={{ overflow: "hidden" }}>
      {/* left division for webcam and canvas */}
      <div className="relative" style={{ width: '70%' }}>
        <div className="relative h-full w-full">
          <Webcam ref={webcamRef}
            mirrored={mirrored}
            style={{ width: '100%' }}
          />
          <canvas ref={canvasRef}
            className="absolute top-0 left-0 h-full w-full object-contain"
          ></canvas>
        </div>
      </div>
      {/* Right division -container for button panels and wiki-section */}
      <div className="flex flex-row flex-1" style={{ flex: '30%' }}>
        <div className="border-primary/5 border-2 max-w-xs flex flex-col gap-2 justify-between shadow-md rounded-md p-4">
          {/* top section */}
          <div className="flex flex-col gap-2"></div>
          <ModeToggle />
          <Button
            variant={'outline'} size={'icon'}
            onClick={() => {
              setMirrored((prev) => !prev)
            }}
          ><FlipHorizontal /></Button>
          <Separator className="my-2" />
          {/* middle section */}
          <div className="flex flex-col gap-2"></div>
          <Separator className="my-2" />
          <Button
            variant={'outline'} size={'icon'}
            onClick={userPromptScreenshot}
          >
            <Camera />
          </Button>
          <Button
            variant={isRecording ? 'destructive' : 'outline'} size={'icon'}
            onClick={userPromptRecord}
          >
            <Video />
          </Button>
          <Separator className="my-2" />
          <Button
            variant={autoRecordEnabled ? 'destructive' : 'outline'}
            size={'icon'}
            onClick={toggleAutoRecord}
          >
            {autoRecordEnabled ? <Rings color="white" height={45} /> : <PersonStanding />}
          </Button>
          {/* bottom section */}
          <div className="flex flex-col gap-2">
            <Separator className="my-2" />
            <Button variant={"outline"} size={"icon"} onClick={toggleVolumeSlider}>
              <Volume2 />
            </Button>
            {/* Volume slider */}
            {showVolumeSlider && (
              <div ref={volumeSliderRef}>
                <Slider value={[volume]} min={0} max={1} step={0.2} onChange={handleVolumeChange} aria-labelledby="continuous-slider" />
              </div>
            )}

          </div>
        </div>
        <div className='h-full flex-1 py-4 px-2 overflow-y-scroll'>
          <RenderFeatureHighlights />
        </div>
      </div>
      {loading && <div className='z-50 absolute w-full h-full flex items-center justify-center bg-primary-foreground'>
        Getting things ready . . . <Rings height={50} color='red' />
      </div>}
    </div>
  )

  //handler functions

  function userPromptScreenshot() {

    //take picture
    if (!webcamRef.current) {
      toast('Camera not found. Please refresh');
    } else {
      const imgSrc = webcamRef.current.getScreenshot();
      console.log(imgSrc);
      const blob = base64toBlob(imgSrc);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formatDate(new Date())}.png`
      a.click();
    }



    //save it to downloads


  }


  function userPromptRecord() {


    if (!webcamRef.current) {
      toast('Camera is not found.Please refresh.')
    }

    if (mediaRecorderRef.current?.state == 'recording') {
      //check if recording
      //then stop recording
      // and save to downloads
      mediaRecorderRef.current.requestData();
      clearTimeout(stopTimeout);
      mediaRecorderRef.current.stop();
      // mediaRecorderRef.current.stop();
      toast('Recording saved to downloads');

    } else {
      // if not recording
      // start recording 
      startRecording(false);
    }

  }

  function startRecording(doBeep: boolean) {
    if (webcamRef.current && mediaRecorderRef.current?.state !== 'recording') {
      mediaRecorderRef.current?.start();
      doBeep && beep(volume)

      stopTimeout = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.requestData();
          mediaRecorderRef.current.stop();
        }

      }, 30000)
    }
  }





  function toggleAutoRecord() {
    if (autoRecordEnabled) {
      setAutoRecordEnabled(false);
      // to toast to user to notify the change
      toast('Autorecord disabled')
    }
    else {
      setAutoRecordEnabled(true);
      //show toast
      toast('Autorecord enabled')
    }
  }

  function RenderFeatureHighlights() {
    return <div className="text-xs text-muted-foreground">
      <ul className="space-y-4">
        <li>
          <strong>Dark Mode/Sys Theme 🌗</strong>
          <p>Toggle between dark mode and system theme.</p>
          <Button className="my-2 h-6 w-6" variant={"outline"} size={"icon"}>
            <SunIcon size={14} />
          </Button>{" "}
          /{" "}
          <Button className="my-2 h-6 w-6" variant={"outline"} size={"icon"}>
            <MoonIcon size={14} />
          </Button>
        </li>
        <li>
          <strong>Horizontal Flip ↔️</strong>
          <p>Adjust horizontal orientation.</p>
          <Button className='h-6 w-6 my-2'
            variant={'outline'} size={'icon'}
            onClick={() => {
              setMirrored((prev) => !prev)
            }}
          ><FlipHorizontal size={14} /></Button>
        </li>
        <Separator />
        <li>
          <strong>Take Pictures 📸</strong>
          <p>Capture snapshots at any moment from the video feed.</p>
          <Button
            className='h-6 w-6 my-2'
            variant={'outline'} size={'icon'}
            onClick={userPromptScreenshot}
          >
            <Camera size={14} />
          </Button>
        </li>
        <li>
          <strong>Manual Video Recording 📽️</strong>
          <p>Manually record video clips as needed.</p>
          <Button className='h-6 w-6 my-2'
            variant={isRecording ? 'destructive' : 'outline'} size={'icon'}
            onClick={userPromptRecord}
          >
            <Video size={14} />
          </Button>
        </li>
        <Separator />
        <li>
          <strong>Enable/Disable Auto Record 🚫</strong>
          <p>
            Option to enable/disable automatic video recording whenever
            required.
          </p>
          <Button className='h-6 w-6 my-2'
            variant={autoRecordEnabled ? 'destructive' : 'outline'}
            size={'icon'}
            onClick={toggleAutoRecord}
          >
            {autoRecordEnabled ? <Rings color='white' height={30} /> : <PersonStanding size={14} />}

          </Button>
        </li>

        <li>
          <strong>Volume Slider 🔊</strong>
          <p>Adjust the volume level of the notifications.</p>
        </li>
        <li>
          <strong>Camera Feed Highlighting 🎨</strong>
          <p>
            Highlights persons in{" "}
            <span style={{ color: "#FF0F0F" }}>red</span> and other objects in{" "}
            <span style={{ color: "#00B612" }}>green</span>.
          </p>
        </li>
        <Separator />
        <li className="space-y-4">
          <strong>Share your thoughts 💬 </strong>
          <SocialMediaLinks />
          <br />
          <br />
          <br />
        </li>
      </ul>
    </div>



  }
}

export default HomePage

function resizeCanvas(canvasRef: React.RefObject<HTMLCanvasElement>, webcamRef: React.RefObject<Webcam>) {
  const canvas = canvasRef.current;
  const video = webcamRef.current?.video;
  if ((canvas && video)) {
    const { videoWidth, videoHeight } = video;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
  }
}

function formatDate(d: Date) {
  const formattedDate =
    [
      (d.getMonth() + 1).toString().padStart(2, "0"),
      d.getDate().toString().padStart(2, "0"),
      d.getFullYear(),
    ]
      .join("-") +
    " " +
    [
      d.getHours().toString().padStart(2, "0"),
      d.getMinutes().toString().padStart(2, "0"),
      d.getSeconds().toString().padStart(2, "0"),
    ].join("-");
  return formattedDate;
}
function base64toBlob(base64Data: any) {
  const byteCharacters = atob(base64Data.split(",")[1]);
  const arrayBuffer = new ArrayBuffer(byteCharacters.length);
  const byteArray = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i);
  }

  return new Blob([arrayBuffer], { type: "image/png" }); // Specify the image type here
}
