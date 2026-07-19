import { useEffect, useRef, useCallback } from 'react';
import { StockfishEngine } from '@/engine/stockfishEngine';
import { useChessStore } from '@/hooks/useChessStore';
import type { AnalysisLine } from '@/types';

export function useStockfish() {
  const engineRef = useRef<StockfishEngine | null>(null);
  const engineState = useChessStore((s) => s.engineState);
  const updateEngineState = useChessStore((s) => s.updateEngineState);

  useEffect(() => {
    const engine = new StockfishEngine();
    engineRef.current = engine;

    engine.onInfo((line) => {
      updateEngineState((prev) => {
        const existing = prev.lines.filter(l => l.multipvIndex !== line.multipvIndex);
        return {
          lines: [...existing, line].sort((a, b) => a.multipvIndex - b.multipvIndex),
        };
      });
    });

    engine.init().then(() => {
      updateEngineState({ isReady: true });
    }).catch(console.error);

    return () => {
      engine.quit();
    };
  }, [updateEngineState]);

  const analyze = useCallback((fen: string, depth?: number, multipv?: number) => {
    if (!engineRef.current?.ready) return;
    updateEngineState({ isAnalyzing: true, lines: [] });
    engineRef.current.analyzePosition(
      fen, 
      depth ?? engineState.depth, 
      multipv ?? engineState.multipv
    );
  }, [engineState.depth, engineState.multipv, updateEngineState]);

  const analyzeAsync = useCallback(async (fen: string, depth?: number, multipv?: number): Promise<AnalysisLine[]> => {
    if (!engineRef.current?.ready) throw new Error('Engine not ready');
    updateEngineState({ isAnalyzing: true, lines: [] });
    const lines = await engineRef.current.analyzePositionAsync(
      fen,
      depth ?? engineState.depth,
      multipv ?? engineState.multipv
    );
    updateEngineState({ isAnalyzing: false, lines });
    return lines;
  }, [engineState.depth, engineState.multipv, updateEngineState]);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    updateEngineState({ isAnalyzing: false });
  }, [updateEngineState]);

  const setDepth = useCallback((depth: number) => {
    updateEngineState({ depth });
  }, [updateEngineState]);

  const setMultiPv = useCallback((multipv: number) => {
    updateEngineState({ multipv });
    engineRef.current?.setOption('MultiPV', multipv);
  }, [updateEngineState]);

  return {
    isReady: engineState.isReady,
    isAnalyzing: engineState.isAnalyzing,
    lines: engineState.lines,
    depth: engineState.depth,
    multipv: engineState.multipv,
    analyze,
    analyzeAsync,
    stop,
    setDepth,
    setMultiPv,
  };
}
