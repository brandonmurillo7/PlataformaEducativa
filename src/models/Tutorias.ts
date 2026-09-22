export class Tutorias {
  constructor(
    public idEstudiante: string,
    public nombreEstudiante: string,
    public materia: string,
    public tema: string,
    public fecha: Date = new Date()
  ) {}
}