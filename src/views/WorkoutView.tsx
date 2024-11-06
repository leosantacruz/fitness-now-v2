import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Pause, Play } from "lucide-react";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";

interface Exercise {
  tipo: string;
  nombre: string;
  duración: string;
  imagen: string;
}

export default function WorkoutView() {
  const [routine, setRoutine] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const timerRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const pausedTimeRef = useRef<number>();
  const totalTimeRef = useRef<number>(0);

  useEffect(() => {
    const savedRoutine = localStorage.getItem("routine");
    if (savedRoutine) {
      setRoutine(JSON.parse(savedRoutine));
    }
  }, []);

  useEffect(() => {
    if (routine.length > 0 && !isPaused && !showCancelDialog) {
      startExercise();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex, routine, isPaused, showCancelDialog]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const startExercise = () => {
    if (currentIndex >= routine.length) {
      setIsComplete(true);
      return;
    }

    const exercise = routine[currentIndex];
    const duration = parseInt(exercise.duración, 10) * 1000;

    if (!pausedTimeRef.current) {
      startTimeRef.current = Date.now();
      const speech = new SpeechSynthesisUtterance(exercise.nombre);
      window.speechSynthesis.speak(speech);
    } else {
      startTimeRef.current = Date.now() - pausedTimeRef.current;
      pausedTimeRef.current = undefined;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current || 0);
      const progress = Math.min((elapsed / duration) * 100, 100);
      setProgress(progress);

      // Update total time
      const totalElapsed = totalTimeRef.current + elapsed / 1000;
      setTotalTime(totalElapsed);

      if (progress >= 100) {
        clearInterval(timerRef.current);
        totalTimeRef.current += parseInt(exercise.duración, 10);
        setCurrentIndex((prev) => prev + 1);
        pausedTimeRef.current = undefined;
      }
    }, 100);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        pausedTimeRef.current = Date.now() - (startTimeRef.current || 0);
      }
      setIsPaused(true);
    }
  };

  const handleCancel = () => {
    setIsPaused(true);
    setShowCancelDialog(true);
  };

  const handleCancelDialogClose = () => {
    setShowCancelDialog(false);
    setIsPaused(false);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            ¡Felicitaciones!
          </h1>
          <p className="mb-6 text-muted-foreground">
            Has completado tu rutina de ejercicios.
          </p>
          <Link to="/">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Home className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const currentExercise = routine[currentIndex];
  const getVisibleExercises = () => {
    const exercises = [];
    for (let i = -2; i <= 2; i++) {
      const index = currentIndex + i;
      if (index >= 0 && index < routine.length) {
        exercises.push({
          ...routine[index],
          position: i,
        });
      }
    }
    return exercises;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with exercise steps and controls */}
      <div className="w-full bg-background/50 backdrop-blur-sm border-b p-4 sticky top-0 z-10">
        <div className="container mx-auto">
          <div className="flex mb-4 w-full">
            {routine.map((_, idx) => (
              <div
                key={idx}
                className={`h-4 transition-all flex-1 ${
                  idx === 0
                    ? "rounded-l-sm"
                    : idx === routine.length - 1
                    ? "rounded-r-sm"
                    : ""
                } ${
                  idx < currentIndex
                    ? "bg-orange-500"
                    : idx === currentIndex
                    ? "bg-orange-500/50"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Ejercicio {currentIndex + 1} de {routine.length}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePauseResume}
                className="w-24"
              >
                {isPaused ? (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Reanudar
                  </>
                ) : (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pausar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-danger hover:text-destructive"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 container mx-auto p-8  flex">
        <div className="grid md:grid-cols-2 gap-8 flex-grow ">
          {/* Left column - Exercise list */}
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold mb-6">
              Secuencia de Ejercicios
            </h2>
            <div className="relative text-center h-full flex flex-col justify-between ">
              {getVisibleExercises().map((exercise) => (
                <div
                  key={currentIndex + exercise.position}
                  className={`transition-all duration-300 ${
                    exercise.position === -2
                      ? "opacity-30 scale-90 text-4xl blur-sm"
                      : exercise.position === -1
                      ? "opacity-50 scale-95 text-6xl blur-sm"
                      : exercise.position === 0
                      ? "opacity-100 scale-100 font-bold text-6xl text-glow"
                      : exercise.position === 1
                      ? "opacity-50 scale-95 text-6xl"
                      : "opacity-30 scale-90 text-4xl"
                  }`}
                >
                  {exercise.nombre}
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Current exercise details */}
          <div className="flex h-full w-full flex-grow items-center">
            <div className="w-full">
              <Card className="p-6">
                <h2 className=" font-bold mb-6 flex justify-between items-center">
                  <span className="text-white/30 text-4xl">Tiempo total </span>
                  <span className="text-6xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    {formatTime(totalTime)}
                  </span>
                </h2>
                <div className="relative mb-6">
                  <Progress value={progress} className="h-4" />
                </div>
                <div className="aspect-video relative overflow-hidden rounded-lg">
                  <img
                    src={currentExercise?.imagen}
                    alt={currentExercise?.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog
        open={showCancelDialog}
        onOpenChange={handleCancelDialogClose}
      >
        <AlertDialogContent>
          <h3 className="text-2xl text-center">¿Estás seguro que querés?</h3>
          <hr />
          <div className="flex justify-center gap-3 ">
            <Button
              size="lg"
              variant="secondary"
              onClick={handleCancelDialogClose}
            >
              No
            </Button>
            <Button asChild size="lg">
              <Link to="/">Si</Link>
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
