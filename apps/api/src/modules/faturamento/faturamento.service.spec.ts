import { AtividadeMei } from '@prisma/client';
import { FaturamentoService } from './faturamento.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TETO_ANUAL_MEI } from './faturamento.constants';

describe('FaturamentoService', () => {
  const empresaId = 'empresa-1';
  let prisma: {
    empresa: { findUniqueOrThrow: jest.Mock };
    venda: { aggregate: jest.Mock; findMany: jest.Mock };
  };
  let service: FaturamentoService;

  beforeEach(() => {
    prisma = {
      empresa: { findUniqueOrThrow: jest.fn() },
      venda: { aggregate: jest.fn(), findMany: jest.fn() },
    };
    service = new FaturamentoService(prisma as unknown as PrismaService);
  });

  it('calcula o teto proporcional para empresa aberta desde janeiro (12 meses)', async () => {
    prisma.empresa.findUniqueOrThrow.mockResolvedValue({
      dataAbertura: new Date(2026, 0, 10),
      atividade: AtividadeMei.COMERCIO,
    });
    prisma.venda.aggregate.mockResolvedValue({ _sum: { valorTotal: 0 } });

    const resultado = await service.termometro(empresaId, 2026);

    expect(resultado.tetoProporcional).toBeCloseTo(TETO_ANUAL_MEI, 2);
  });

  it('proraciona o teto para empresa aberta em julho (6 meses)', async () => {
    prisma.empresa.findUniqueOrThrow.mockResolvedValue({
      dataAbertura: new Date(2026, 6, 1), // julho
      atividade: AtividadeMei.SERVICOS,
    });
    prisma.venda.aggregate.mockResolvedValue({ _sum: { valorTotal: 0 } });

    const resultado = await service.termometro(empresaId, 2026);

    expect(resultado.tetoProporcional).toBeCloseTo(
      (TETO_ANUAL_MEI / 12) * 6,
      2,
    );
  });

  it('sinaliza alerta quando o faturamento atinge 80% do teto', async () => {
    prisma.empresa.findUniqueOrThrow.mockResolvedValue({
      dataAbertura: new Date(2026, 0, 1),
      atividade: AtividadeMei.COMERCIO,
    });
    prisma.venda.aggregate.mockResolvedValue({
      _sum: { valorTotal: TETO_ANUAL_MEI * 0.85 },
    });

    const resultado = await service.termometro(empresaId, 2026);

    expect(resultado.alerta).toBe('80%');
    expect(resultado.desenquadramentoIminente).toBe(false);
  });
});
