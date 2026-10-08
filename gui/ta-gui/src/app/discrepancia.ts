// Value object: a discrepância de um aluno em uma turma. Quando não pode ser
// calculada, carrega o motivo, para que o cliente explique ao professor o que
// falta em vez de exibir um valor enganoso.
export class Discrepancia {
  private constructor(private readonly valor: number, private readonly motivo: string) {}

  static de(valor: number): Discrepancia {
    return new Discrepancia(valor, null);
  }

  static naoCalculavel(motivo: string): Discrepancia {
    return new Discrepancia(null, motivo);
  }

  foiCalculada(): boolean {
    return this.motivo === null;
  }

  getValor(): number {
    return this.valor;
  }

  getMotivo(): string {
    return this.motivo;
  }

  // Verdadeiro apenas quando calculada e estritamente maior que o limiar.
  excede(limiar: number): boolean {
    return this.foiCalculada() && this.valor > limiar;
  }
}
