import heapq
import math
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

class Node:
    def __init__(self, name, coordinates, tags, features):
        self.name = name
        self.coordinates = coordinates
        self.tags = tags
        self.features = features
        self.edges = []

    def __lt__(self, other):
        return self.name < other.name

class Edge:
    def __init__(self, edge_id, node, properties, weights):
        self.edge_id = edge_id
        self.node = node
        self.properties = properties
        self.weight = self.calculate_weight(properties, weights)

    def calculate_weight(self, properties, weights):
        weight = sum(p * w for p, w in zip(properties, weights))
        return weight

class Graph:
    def __init__(self):
        self.nodes = {}

    def add_node(self, name, coordinates, tags, features):
        self.nodes[name] = Node(name, coordinates, tags, features)

    def add_edge(self, from_node, to_node, edge_id, properties, weights):
        self.nodes[from_node].edges.append(Edge(edge_id, self.nodes[to_node], properties, weights))

def heuristic(node, goal):
    return math.sqrt((node.coordinates[0] - goal.coordinates[0])**2 + (node.coordinates[1] - goal.coordinates[1])**2)

def a_star(graph, start, goal, weights, need=None):
    open_set = []
    heapq.heappush(open_set, (0, graph.nodes[start]))
    came_from = {}
    g_score = {node: float('inf') for node in graph.nodes}
    g_score[start] = 0
    f_score = {node: float('inf') for node in graph.nodes}
    f_score[start] = heuristic(graph.nodes[start], graph.nodes[goal])
    
    while open_set:
        _, current = heapq.heappop(open_set)
        
        if current.name == goal:
            path = []
            edges = []
            while current.name in came_from:
                path.append(current.name)
                current, edge = came_from[current.name]
                edges.append(edge)
            path.append(start)
            path.reverse()
            edges.reverse()
            return path, edges
        
        for edge in current.edges:
            if need == "需要坐轮椅" and edge.properties[2] == 1 and edge.properties[4] == 0:  #有楼梯且无无障碍电梯
                continue
            tentative_g_score = g_score[current.name] + edge.weight
            if tentative_g_score < g_score[edge.node.name]:
                came_from[edge.node.name] = (current, edge)
                g_score[edge.node.name] = tentative_g_score
                f_score[edge.node.name] = tentative_g_score + heuristic(edge.node, graph.nodes[goal])
                heapq.heappush(open_set, (f_score[edge.node.name], edge.node))
    
    return None, None

def generate_weights(weights1, weights2):
    new_weights = []
    for w1, w2 in zip(weights1, weights2):
        product = w1 * w2
        if product < 0:
            new_weights.append(w1)
        elif product > 0:
            new_weights.append(w1 + w2)
        elif w1 == 0:
            new_weights.append(w2)
        else:
            new_weights.append(w1)
    return new_weights

def generate_routes(start, goal, weights1, weights2):
    # 创建图
    graph1 = Graph()
    graph2 = Graph()

    # 读取Excel文件
    nodes_df = pd.read_excel('地图数据表.xlsx', sheet_name='node')
    edges_df = pd.read_excel('地图数据表.xlsx', sheet_name='edge')

    # 添加节点
    for index, row in nodes_df.iterrows():
        coordinates = tuple(map(float, row['经纬度'].split(',')))
        graph1.add_node(row['名称'], coordinates, [], [])
        graph2.add_node(row['名称'], coordinates, [], [])

    # 标准化边的属性到1-10的范围
    properties_columns = [
        '长度（m）', '路灯覆盖率', '楼梯', '扶梯', '无障碍电梯', 
        '盲道', '坡度', '绿化', '平坦', '海景', '空调', '遮挡-阴凉', '方便避雨'
    ]
    scaler = MinMaxScaler(feature_range=(1, 10))
    scaled_properties = scaler.fit_transform(edges_df[properties_columns])

    # 输入weights1和weights2
    # weights1 = [1, 1, 0, -1, -1, 0, 0, 1, 0, 0, 0, 0, 0]
    # weights2 = [5, 1, 0, 1, 1, 0, 2, 0, 1, 0, 0, 1, 1]

    # 生成新的weights
    new_weights = generate_weights(weights1, weights2)

    # 添加边
    for index, row in edges_df.iterrows():
        properties = scaled_properties[index]
        graph1.add_edge(row['起点'], row['终点'], row['名称'], properties, weights1)
        graph2.add_edge(row['起点'], row['终点'], row['名称'], properties, new_weights)

    # 使用weights1和new_weights计算路径
    # start = 'West Gate（A2）'
    # goal = 'Knowles Building'
    path1, edges1 = a_star(graph1, start, goal, weights1)
    path2, edges2 = a_star(graph2, start, goal, new_weights)

    result = {}
    result['path1'] = {}
    result['path2'] = {}

    if path1:
        print("根据您的需求，找到路径：", path1)
        print("经过的边:", [(edge.edge_id) for edge in edges1])
        result['path1']['path'] = path1
        result['path1']['edges'] = [(edge.edge_id) for edge in edges1]
    else:
        print("没有找到路径")

    if path2:
        print("和您相似的用户倾向于选择的路径是：", path2)
        print("经过的边:", [(edge.edge_id) for edge in edges2])
        result['path2']['path'] = path2
        result['path2']['edges'] = [(edge.edge_id) for edge in edges2]
    else:
        print("没有找到路径")

    print(result)
    return result


generate_routes('West Gate（A2）', 'Knowles Building', [1, 1, 0, -1, -1, 0, 0, 1, 0, 0, 0, 0, 0], [5, 1, 0, 1, 1, 0, 2, 0, 1, 0, 0, 1, 1])