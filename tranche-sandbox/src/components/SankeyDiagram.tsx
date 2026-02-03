import { useMemo, useRef, useState } from 'react';
import type { TrancheData } from '../types';
import { computeFundingMatrix } from '../math/fundingMatrix';
import { ExportButton } from './ExportButton';

interface SankeyDiagramProps {
  tranches: TrancheData[];
}

// Colors for each tranche (matching SEGMENT_COLORS from DynamicLoanMix)
const TRANCHE_COLORS = [
  { fill: '#10b981', stroke: '#059669' }, // emerald-500/600
  { fill: '#14b8a6', stroke: '#0d9488' }, // teal-500/600
  { fill: '#f59e0b', stroke: '#d97706' }, // amber-500/600
  { fill: '#f97316', stroke: '#ea580c' }, // orange-500/600
  { fill: '#ef4444', stroke: '#dc2626' }, // red-500/600
];

// Gradient IDs for flow paths
const getGradientId = (lenderIdx: number, borrowerIdx: number) =>
  `flow-gradient-${lenderIdx}-${borrowerIdx}`;

interface FlowData {
  lenderIdx: number;
  borrowerIdx: number;
  amount: number;
  percentOfLender: number;
  lenderLltv: number;
  borrowerLltv: number;
}

interface HoveredFlow {
  lenderIdx: number;
  borrowerIdx: number;
}

export function SankeyDiagram({ tranches }: SankeyDiagramProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [hoveredFlow, setHoveredFlow] = useState<HoveredFlow | null>(null);

  // SVG dimensions
  const width = 700;
  const height = 400;
  const paddingLeft = 120;
  const paddingRight = 120;
  const paddingTop = 40;
  const paddingBottom = 40;

  // Node dimensions
  const nodeWidth = 24;
  const minNodeHeight = 20;
  const nodeGap = 12;

  const fundingData = useMemo(() => {
    return computeFundingMatrix(tranches, false);
  }, [tranches]);

  // Compute flows between tranches
  const flows: FlowData[] = useMemo(() => {
    const result: FlowData[] = [];
    for (const entry of fundingData.entries) {
      if (entry.amount > 0) {
        result.push({
          lenderIdx: entry.lenderIndex,
          borrowerIdx: entry.borrowerIndex,
          amount: entry.amount,
          percentOfLender: entry.percentOfLenderSupply,
          lenderLltv: tranches[entry.lenderIndex].lltv,
          borrowerLltv: tranches[entry.borrowerIndex].lltv,
        });
      }
    }
    return result;
  }, [fundingData, tranches]);

  // Compute node positions and sizes
  const { lenderNodes, borrowerNodes, maxSupply, maxBorrow } = useMemo(() => {
    const totalSupply = tranches.reduce((sum, t) => sum + t.supplyAssets, 0);
    const totalBorrow = tranches.reduce((sum, t) => sum + t.borrowAssets, 0);
    const maxVal = Math.max(totalSupply, totalBorrow);

    const availableHeight = height - paddingTop - paddingBottom;

    // Calculate lender nodes (left side)
    const lenderData = tranches.map((t, idx) => ({
      idx,
      lltv: t.lltv,
      supply: t.supplyAssets,
    }));

    // Calculate borrower nodes (right side)
    const borrowerData = tranches.map((t, idx) => ({
      idx,
      lltv: t.lltv,
      borrow: t.borrowAssets,
    }));

    // Scale factor for node heights
    const scaleFactor = maxVal > 0 ? (availableHeight - (tranches.length - 1) * nodeGap) / maxVal : 1;

    // Position lender nodes
    let lenderY = paddingTop;
    const lenderNodes = lenderData.map((l) => {
      const nodeHeight = Math.max(minNodeHeight, l.supply * scaleFactor);
      const node = {
        idx: l.idx,
        lltv: l.lltv,
        supply: l.supply,
        x: paddingLeft,
        y: lenderY,
        width: nodeWidth,
        height: nodeHeight,
      };
      lenderY += nodeHeight + nodeGap;
      return node;
    });

    // Position borrower nodes
    let borrowerY = paddingTop;
    const borrowerNodes = borrowerData.map((b) => {
      const nodeHeight = Math.max(minNodeHeight, b.borrow * scaleFactor);
      const node = {
        idx: b.idx,
        lltv: b.lltv,
        borrow: b.borrow,
        x: width - paddingRight - nodeWidth,
        y: borrowerY,
        width: nodeWidth,
        height: nodeHeight,
      };
      borrowerY += nodeHeight + nodeGap;
      return node;
    });

    return { lenderNodes, borrowerNodes, maxSupply: totalSupply, maxBorrow: totalBorrow };
  }, [tranches, height, paddingTop, paddingBottom, width, paddingLeft, paddingRight]);

  // Track flow offsets for stacking flows within nodes
  const flowPaths = useMemo(() => {
    // Track how much of each node's height has been used for flows
    const lenderOffsets = lenderNodes.map(() => 0);
    const borrowerOffsets = borrowerNodes.map(() => 0);

    const maxVal = Math.max(maxSupply, maxBorrow);
    const availableHeight = height - paddingTop - paddingBottom;
    const scaleFactor = maxVal > 0 ? (availableHeight - (tranches.length - 1) * nodeGap) / maxVal : 1;

    // Sort flows by lender index, then borrower index
    const sortedFlows = [...flows].sort((a, b) => {
      if (a.lenderIdx !== b.lenderIdx) return a.lenderIdx - b.lenderIdx;
      return a.borrowerIdx - b.borrowerIdx;
    });

    return sortedFlows.map((flow) => {
      const lender = lenderNodes[flow.lenderIdx];
      const borrower = borrowerNodes[flow.borrowerIdx];

      // Calculate flow height based on amount
      const flowHeightLender = Math.max(2, flow.amount * scaleFactor * (lender.supply > 0 ? lender.height / (lender.supply * scaleFactor) : 1));
      const flowHeightBorrower = Math.max(2, flow.amount * scaleFactor * (borrower.borrow > 0 ? borrower.height / (borrower.borrow * scaleFactor) : 1));

      // Get current offsets
      const startY = lender.y + lenderOffsets[flow.lenderIdx];
      const endY = borrower.y + borrowerOffsets[flow.borrowerIdx];

      // Update offsets
      lenderOffsets[flow.lenderIdx] += flowHeightLender;
      borrowerOffsets[flow.borrowerIdx] += flowHeightBorrower;

      // Create bezier curve path
      const startX = lender.x + nodeWidth;
      const endX = borrower.x;
      const midX = (startX + endX) / 2;

      // Path: Start at top-left of flow, curve to top-right, line down to bottom-right, curve back to bottom-left
      const path = `
        M ${startX} ${startY}
        C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}
        L ${endX} ${endY + flowHeightBorrower}
        C ${midX} ${endY + flowHeightBorrower}, ${midX} ${startY + flowHeightLender}, ${startX} ${startY + flowHeightLender}
        Z
      `;

      return {
        ...flow,
        path,
        startX,
        startY,
        endX,
        endY,
        flowHeightLender,
        flowHeightBorrower,
      };
    });
  }, [flows, lenderNodes, borrowerNodes, maxSupply, maxBorrow, height, paddingTop, paddingBottom, tranches.length]);

  // Format dollar amounts
  const formatAmount = (amount: number) => {
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    } else if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const formatPercent = (pct: number) => `${(pct * 100).toFixed(1)}%`;

  return (
    <div ref={exportRef} className="export-section relative bg-lotus-grey-800 rounded-lg p-4 pb-6 border border-lotus-grey-700">
      <ExportButton targetRef={exportRef} filename="liquidity-flow-diagram" />

      <h4 className="text-lg font-semibold text-lotus-grey-100 text-center pr-10 mb-4">
        Liquidity Flow Diagram
      </h4>

      <p className="text-sm text-lotus-grey-300 mb-4 text-center">
        Shows how supply from each lender tranche flows to borrowers at different tranches.
        Junior lenders fund borrowers at their own tranche and all more senior tranches.
      </p>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ maxHeight: '450px' }}
      >
        {/* Gradient definitions for flows */}
        <defs>
          {flows.map((flow) => (
            <linearGradient
              key={getGradientId(flow.lenderIdx, flow.borrowerIdx)}
              id={getGradientId(flow.lenderIdx, flow.borrowerIdx)}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={TRANCHE_COLORS[flow.lenderIdx].fill} stopOpacity={0.7} />
              <stop offset="100%" stopColor={TRANCHE_COLORS[flow.borrowerIdx].fill} stopOpacity={0.7} />
            </linearGradient>
          ))}
        </defs>

        {/* Column labels */}
        <text x={paddingLeft + nodeWidth / 2} y={20} textAnchor="middle" className="fill-lotus-grey-400 text-sm font-medium">
          LENDERS
        </text>
        <text x={width - paddingRight - nodeWidth / 2} y={20} textAnchor="middle" className="fill-lotus-grey-400 text-sm font-medium">
          BORROWERS
        </text>

        {/* Flow paths */}
        {flowPaths.map((flow, idx) => {
          const isHovered = hoveredFlow?.lenderIdx === flow.lenderIdx && hoveredFlow?.borrowerIdx === flow.borrowerIdx;
          const isRelated = hoveredFlow && (hoveredFlow.lenderIdx === flow.lenderIdx || hoveredFlow.borrowerIdx === flow.borrowerIdx);
          const opacity = hoveredFlow ? (isHovered ? 0.9 : isRelated ? 0.4 : 0.15) : 0.6;

          return (
            <g key={idx}>
              <path
                d={flow.path}
                fill={`url(#${getGradientId(flow.lenderIdx, flow.borrowerIdx)})`}
                stroke={isHovered ? TRANCHE_COLORS[flow.lenderIdx].stroke : 'transparent'}
                strokeWidth={isHovered ? 1.5 : 0}
                opacity={opacity}
                className="transition-opacity duration-150 cursor-pointer"
                onMouseEnter={() => setHoveredFlow({ lenderIdx: flow.lenderIdx, borrowerIdx: flow.borrowerIdx })}
                onMouseLeave={() => setHoveredFlow(null)}
              />
              {/* Flow label - show on hover or if flow is significant */}
              {(isHovered || flow.percentOfLender > 0.2) && (
                <text
                  x={(flow.startX + flow.endX) / 2}
                  y={(flow.startY + flow.endY) / 2 + (flow.flowHeightLender + flow.flowHeightBorrower) / 4}
                  textAnchor="middle"
                  className={`text-xs font-mono ${isHovered ? 'fill-white' : 'fill-lotus-grey-300'}`}
                  style={{ pointerEvents: 'none' }}
                >
                  {formatAmount(flow.amount)}
                </text>
              )}
            </g>
          );
        })}

        {/* Lender nodes */}
        {lenderNodes.map((node) => {
          const isHighlighted = hoveredFlow?.lenderIdx === node.idx;
          return (
            <g key={`lender-${node.idx}`}>
              <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                fill={TRANCHE_COLORS[node.idx].fill}
                stroke={isHighlighted ? 'white' : TRANCHE_COLORS[node.idx].stroke}
                strokeWidth={isHighlighted ? 2 : 1}
                rx={4}
                className="transition-all duration-150"
              />
              {/* LLTV label */}
              <text
                x={node.x - 8}
                y={node.y + node.height / 2}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-lotus-grey-200 text-sm font-medium"
              >
                {node.lltv}%
              </text>
              {/* Supply amount */}
              <text
                x={node.x - 8}
                y={node.y + node.height / 2 + 14}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-lotus-grey-400 text-xs font-mono"
              >
                {formatAmount(node.supply)}
              </text>
            </g>
          );
        })}

        {/* Borrower nodes */}
        {borrowerNodes.map((node) => {
          const isHighlighted = hoveredFlow?.borrowerIdx === node.idx;
          return (
            <g key={`borrower-${node.idx}`}>
              <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                fill={TRANCHE_COLORS[node.idx].fill}
                stroke={isHighlighted ? 'white' : TRANCHE_COLORS[node.idx].stroke}
                strokeWidth={isHighlighted ? 2 : 1}
                rx={4}
                className="transition-all duration-150"
              />
              {/* LLTV label */}
              <text
                x={node.x + node.width + 8}
                y={node.y + node.height / 2}
                textAnchor="start"
                dominantBaseline="middle"
                className="fill-lotus-grey-200 text-sm font-medium"
              >
                {node.lltv}%
              </text>
              {/* Borrow amount */}
              <text
                x={node.x + node.width + 8}
                y={node.y + node.height / 2 + 14}
                textAnchor="start"
                dominantBaseline="middle"
                className="fill-lotus-grey-400 text-xs font-mono"
              >
                {formatAmount(node.borrow)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoveredFlow && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-lotus-grey-900 border border-lotus-grey-600 rounded-lg px-4 py-2 shadow-lg">
          <div className="text-sm text-lotus-grey-100">
            <span className="font-medium" style={{ color: TRANCHE_COLORS[hoveredFlow.lenderIdx].fill }}>
              {tranches[hoveredFlow.lenderIdx].lltv}% Lenders
            </span>
            <span className="text-lotus-grey-400 mx-2">→</span>
            <span className="font-medium" style={{ color: TRANCHE_COLORS[hoveredFlow.borrowerIdx].fill }}>
              {tranches[hoveredFlow.borrowerIdx].lltv}% Borrowers
            </span>
          </div>
          {(() => {
            const flow = flowPaths.find(
              (f) => f.lenderIdx === hoveredFlow.lenderIdx && f.borrowerIdx === hoveredFlow.borrowerIdx
            );
            if (!flow) return null;
            return (
              <div className="text-xs text-lotus-grey-300 mt-1">
                <span className="font-mono">{formatAmount(flow.amount)}</span>
                <span className="mx-1">·</span>
                <span>{formatPercent(flow.percentOfLender)} of lender supply</span>
              </div>
            );
          })()}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-4 mt-4 border-t border-lotus-grey-700 justify-center">
        <span className="text-xs text-lotus-grey-400">Tranches:</span>
        {tranches.map((t, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: TRANCHE_COLORS[i].fill }}
            />
            <span className="text-xs" style={{ color: TRANCHE_COLORS[i].fill }}>
              {t.lltv}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SankeyDiagram;
