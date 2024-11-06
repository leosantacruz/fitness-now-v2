import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Play } from "lucide-react";

interface Exercise {
  tipo: string;
  nombre: string;
  duración: string;
  imagen: string;
}

export default function AdminView() {
  const [validRoutine, setValidRoutine] = useState<boolean>(true);
  const [routineJson, setRoutineJson] = useState<string>(() => {
    const saved = localStorage.getItem("routine");
    return saved || "[]";
  });

  const [stats, setStats] = useState({
    exercises: 0,
    restTime: "00:00",
    totalTime: 0,
  });

  useEffect(() => {
    try {
      const routine = JSON.parse(routineJson) as Exercise[];
      const exercises = routine.filter((ex) => ex.tipo === "ejercicio").length;

      const restTimeFilter = routine
        .filter((ex) => ex.tipo === "descanso")
        .reduce((acc, ex) => acc + parseInt(ex.duración, 10), 0);

      const minutes = Math.floor(restTimeFilter / 60);
      const seconds = restTimeFilter % 60;
      const restTime = `${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;

      const totalTime = routine.reduce(
        (acc, ex) => acc + parseInt(ex.duración, 10),
        0
      );

      setStats({
        exercises,
        restTime: restTime,
        totalTime: Math.floor(totalTime / 60),
      });
      localStorage.setItem("routine", routineJson);
      setValidRoutine(true);
      console.log("Guardado con exito!");
    } catch (error) {
      console.error("Invalid JSON");
      setValidRoutine(false);
    }
  }, [routineJson]);

  return (
    <div className="container mx-auto p-8 flex flex-col flex-1">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent flex flex-row items-center gap-3">
          <img src="/logo.png" width="50" /> Fitness v2
        </h1>
        <Link to="/workout">
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Play className="mr-2 h-4 w-4" />
            Empezar rutina
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8 flex-grow">
        <div>
          <Card className="p-6 h-full transition-all duration-300 border-orange-500/20 hover:border-orange-500 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex flex-row items-center gap-3">
              <svg width="15" height="15" viewBox="0 0 448 448" version="1.1">
                <g id="layer1" transform="translate(0,-604.36224)">
                  <circle
                    fill={validRoutine ? "#00D361" : "#FF0000"}
                    id="path3334"
                    cx="224"
                    cy="828.36224"
                    r="192"
                  />
                </g>
              </svg>
              <span> Rutina</span>
            </h2>
            <Textarea
              value={routineJson}
              onChange={(e) => setRoutineJson(e.target.value)}
              className="min-h-[400px] font-mono flex-grow"
              placeholder="Enter your routine JSON here..."
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 transition-all duration-300 border-orange-500/20 hover:border-orange-500 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Estadisticas</h2>
            <div className="grid grid-row-3 gap-4 flex-grow ">
              <div className="text-center p-4 bg-muted rounded-lg flex flex-col items-center justify-center">
                <p className="text-6xl font-bold text-orange-500">
                  {stats.exercises}
                </p>
                <p className="text-xl mt-2 text-muted-foreground">Ejercicios</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg flex flex-col items-center justify-center">
                <p className="text-6xl font-bold text-orange-500">
                  {stats.restTime}
                </p>
                <p className="text-xl mt-2 text-muted-foreground">
                  Minutos de descanso
                </p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg flex flex-col items-center justify-center">
                <p className="text-6xl font-bold text-orange-500">
                  {stats.totalTime}
                </p>
                <p className="text-xl mt-2 text-muted-foreground">
                  Minutos totales
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
