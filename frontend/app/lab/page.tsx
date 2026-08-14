"use client";

import { useEffect, useState } from "react";

type Metadata = {
  model_type: string;
  training_date: string;
  gesture_labels: string[];
  num_gestures: number;
  feature_count: number;
  dataset_size: number;
  train_size: number;
  test_size: number;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
  confusion_matrix: {
    labels: string[];
    matrix: number[][];
  };
};

export default function ModelLabPage() {
  const [meta, setMeta] = useState<Metadata | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/model-info")
      .then((res) => res.json())
      .then(setMeta)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="px-6 py-16">
        <h1 className="text-2xl font-semibold">Model Lab</h1>
        <p className="mt-4 text-red-400">
          Could not load model metadata. Is the backend running?
        </p>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="px-6 py-16">
        <h1 className="text-2xl font-semibold">Model Lab</h1>
        <p className="mt-4 text-neutral-500">Loading model metadata...</p>
      </div>
    );
  }

  const stats = [
    { label: "Model", value: meta.model_type },
    { label: "Gestures", value: meta.num_gestures },
    { label: "Training Samples", value: meta.train_size },
    { label: "Test Samples", value: meta.test_size },
    { label: "Features", value: meta.feature_count },
    { label: "Accuracy", value: `${(meta.metrics.accuracy * 100).toFixed(1)}%` },
    { label: "Precision", value: `${(meta.metrics.precision * 100).toFixed(1)}%` },
    { label: "Recall", value: `${(meta.metrics.recall * 100).toFixed(1)}%` },
    { label: "F1 Score", value: `${(meta.metrics.f1_score * 100).toFixed(1)}%` },
  ];

  const maxVal = Math.max(...meta.confusion_matrix.matrix.flat());

  return (
    <div className="px-6 py-16">
      <h1 className="text-2xl font-semibold">Model Lab</h1>
      <p className="mt-2 text-neutral-500">
        Trained {new Date(meta.training_date).toLocaleDateString()} on{" "}
        {meta.dataset_size} samples.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-4 max-w-3xl">
        {stats.map((s) => (
          <div
            key={s.label}
            className="border border-neutral-800 rounded-lg p-4"
          >
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              {s.label}
            </p>
            <p className="mt-1 text-xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-lg font-semibold">Confusion Matrix</h2>
      <p className="text-sm text-neutral-500 mb-4">
        Rows = actual gesture, columns = predicted gesture
      </p>
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse">
          <thead>
            <tr>
              <th className="p-2"></th>
              {meta.confusion_matrix.labels.map((l) => (
                <th
                  key={l}
                  className="p-2 text-neutral-500 font-normal whitespace-nowrap"
                >
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {meta.confusion_matrix.matrix.map((row, i) => (
              <tr key={i}>
                <td className="p-2 text-neutral-500 whitespace-nowrap">
                  {meta.confusion_matrix.labels[i]}
                </td>
                {row.map((val, j) => {
                  const intensity = val / maxVal;
                  return (
                    <td
                      key={j}
                      className="p-2 text-center border border-neutral-800"
                      style={{
                        backgroundColor: `rgba(34, 211, 238, ${intensity * 0.6})`,
                      }}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
