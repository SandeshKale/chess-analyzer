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

    engine.onMessage((msg) => {
      if (msg === 'readyok') {
        updateEngineState({ isReady: true });
      } else if (msg === 'bestmove') {
        updateEngineState({ isAnalyzing: false });
      } else {
        updateEngineState((prev) => {
          const existing = prev.lines.filter(l => l.multipvIndex !== msg.multipvIndex);
          return {
            lines: [...existing, msg].sort((a, b) => a.multipvIndex - b.multipvIndex),
          };
        });
      }
    });

    engine.init().catch(console.error);

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
    stop,
    setDepth,
    setMultiPv,
  };
}
