export class Tutorias {
  constructor(
    public studentId: string,
    public studentName: string,
    public topic: string,
    public timestamp: Date = new Date()
  ) {}
}