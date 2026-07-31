//
//  AIAgentMockRecordMeta.swift
//  QuickStart
//
//  Created by Celine Moon on 6/8/26.
//

import Foundation

/// Snapshot of the real identifiers the host app used to drive a recording.
/// Written to `Documents/SBA-RecordMeta/<scenario>.json` once record-mode setup
/// completes so the host-side `record:sanitize` step can substitute these live
/// values out of the captured raw fixture without re-parsing OSLog text.
struct AIAgentMockRecordMeta: Codable {
    let scenario: String
    let appId: String
    let aiAgentId: String
    let userId: String
    let channelURL: String

    static func write(
        scenario: String,
        appId: String,
        aiAgentId: String,
        userId: String,
        channelURL: String
    ) throws {
        let meta = AIAgentMockRecordMeta(
            scenario: scenario,
            appId: appId,
            aiAgentId: aiAgentId,
            userId: userId,
            channelURL: channelURL
        )

        let documents = try FileManager.default.url(
            for: .documentDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: true
        )
        let directory = documents.appendingPathComponent("SBA-RecordMeta", isDirectory: true)
        try FileManager.default.createDirectory(
            at: directory,
            withIntermediateDirectories: true
        )

        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        let data = try encoder.encode(meta)
        let fileURL = directory.appendingPathComponent("\(scenario).json")
        try data.write(to: fileURL, options: .atomic)
        print("[AIAgentMockRecordMeta] wrote \(fileURL.path)")
    }
}
