//
//  AIAgentMockPreprodCredentials.swift
//  QuickStart
//
//  Created by Celine Moon on 6/5/26.
//

import Foundation

/// Fixed preprod credentials for MockUITests record mode.
/// Mirrors `AIAgentTestCredentials` from the integration test target so QuickStart
/// (which cannot import test target code) can do the same preprod setup.
enum AIAgentMockPreprodCredentials {
    static let appId = "A09D8790-B95C-4778-B28D-33622D62792B"
    static let agentId = "f34bffce-714c-4bb1-8daf-3858527b4dd5"
}
